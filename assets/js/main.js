const main = (() => {

     // Criação de um método para comparar 2 Arrays
     Array.prototype.equals = function (array) {
        if (!array)
            return false;

        if (this.length != array.length)
            return false;

        for (var i = 0, l = this.length; i < l; i++) {
            if (this[i] instanceof Array && array[i] instanceof Array) {
                if (!this[i].equals(array[i]))
                    return false;
            }
            else if (this[i] != array[i]) {
                return false;
            }
        }
        return true;
    }
    Object.defineProperty(Array.prototype, "equals", { enumerable: false });


    // Objeto trajeto 
    let trajetoConstructor = {
        distancia: -Math.max(),
        percurso: [],
        listaTabu: []
    };

    // Carrega os elementos visuais que sofrem alterações
    const progress = document.getElementById('progress');
    const progressBar = document.getElementById('progressBar');
    const inputElement = document.getElementById("input");
    const result = document.getElementById('result');
    const btnLer = document.querySelector('.ler');

    // Atributos da função main
    let percent;
    let title;
    let fileList;
    let iteracaoTotal = 0;
    let arrRes;
    let misses = 0;
    let iteracao;
    const numIteracao = 1000000; //10.000.000
    let interval;
    let onLoad = false;
    let trajeto = { ...trajetoConstructor };
    let count = 0;

    // Função que cria a tabela dentro da div do html
    const createTable = (array, className) => {
        const divForm = document.querySelector('.div-form');

        // Limpa O formulário ao carregar o arquivo 
        while (divForm.children.length > 0) {
            divForm.removeChild(divForm.lastChild);
        }

        if (array !== null) {

            const table = document.createElement('table');
            table.className = className;

            let t = '';
            t += '<tr class="row">';
            t += array.map((e, i) => `<td class="data-header"> ${i+1} </td>` );
            t += '</tr>';
            t += array.map((element, index) => `<tr class="row"><td class="data-row"> ${index+1} </td> 
            ${element.map((e,i) => i===0?`<td class="firstData"> ${e} </td>`:`<td class="dataTable"> ${e} </td>`)} </tr>`);
            t = t.replaceAll(',', '')

            table.innerHTML = t;

            const h2 = document.createElement('h2');
            h2.innerHTML = (className === 'table') ? 'Tabela de entrada:' : 'Tabela resultado:'

            divForm.appendChild(h2);
            divForm.appendChild(table);
        }
    }

    // Função responsável para converter o txt em array
    const txtToArray = txt => {

        const linhas = txt.split('\n');
        const array = [];

        let index = 1;

        for (let linha of linhas) {
             if (linha.indexOf("COMMENT") >= 0) title = (linha.substr(linha.indexOf(':') + 2));

            try {
                if (linha.indexOf(index) === 0) {
                    const line = linha.replace(`${index} `, '');
                    array.push(line.split(' '));

                    array[index - 1].map((e, i) => array[index - 1][i] = (parseFloat(e)));
                    // console.log(array[index -1]);
                    index++;
                }
            }
            catch (e) {
                alert(`Arquivo invalido, erro no conteúdo ${array[index]}`);
                return null;
            }
        }
        
        const newArray = [];

        for (let element in array) {

            const tempArray = [];
            const x1 = array[element][0];
            const y1 = array[element][1];

            array.map(e=> tempArray.push(parseFloat(Math.sqrt((x1 - e[0])**2 + (y1 - e[1])**2)).toFixed(1)));
            newArray.push(tempArray);
        }
        return newArray;
    }

    // Função que executa a logica da busca tabu
    const buscaTabu = () => {
        // Verifica se há algum percurso senão cria um vazio
        const percursoI = (trajeto.percurso.length > 0) ? [...trajeto.percurso] : [];

        let distanciaI = 0;

        // Se o percurso é vazio cria o primeiro percurso sequencial a partir do marco 0 até o 0 novamente
        if (percursoI.length === 0) {
            for (let i = 1; i < fileList.length; i++) { percursoI.push(i) };
            percursoI.push(0); // Marco 0 
        } else {
            // Logica para gerar o swap na lista
            let newTabu = false;
            do {
                let swap1 = Math.round(Math.random() * (trajeto.percurso.length - 2) + 0);
                let swap2 = Math.round(Math.random() * (trajeto.percurso.length - 2) + 0);

                if (swap1 != swap2) {
                    const tabu = [swap1, swap2];

                    // Se não a tabu salva a primeira restrição e sai do while
                    if (trajeto.listaTabu.length === 0) {
                        // Função que altera a posição de 2 elementos em um array
                        percursoI.splice(swap1, 0, percursoI.splice(swap2, 1)[0]);
                        trajeto.listaTabu.push(tabu);
                        break;
                    }

                    // Verifica se a combinação gerada já não esta na lista tabu
                    for (let i = 0; i < trajeto.listaTabu.length; i++) {
                        const tabuA = trajeto.listaTabu[i];
                        const tabuI = [...tabu];

                        // Compara se existe o a combinação gerada na lista tabu
                        if (tabu.equals(tabuA) || tabuI.reverse().equals(tabuA)) break;

                        // No final do for ele salva o novo tabu e aplica o Swap
                        if (trajeto.listaTabu.length - 1 === i) {
                            tabuA.push(tabu);
                            percursoI.splice(swap1, 0, percursoI.splice(swap2, 1)[0]);

                            //Remove elementos da lista tabu
                            if (tabuA.length > trajeto.percurso.length * 4) tabuA.shift();
                            newTabu = true;
                        }
                    }
                }
            } while (newTabu !== true);

        }
        // Soma o novo percurso gerado
        let passo = 0;
        for (let i = 0; i < fileList.length; i++) {
            const next = percursoI[i];
            distanciaI += parseFloat(fileList[passo][next]);
            passo = next;
        }
        // Verifica se no novo percurso é menor que o salvo
        if (trajeto.distancia > distanciaI) {
            trajeto.distancia = parseFloat(distanciaI).toFixed(2);
            trajeto.percurso = percursoI;
            misses = 0;
        } else misses++; // Soma sequencia de Pioras para forcar sair de regiões ótimas

    }

    // Adiciona o Listener no botão Ler
    btnLer.addEventListener('click', event => {
        event.preventDefault();

        // Verifica se há um documento no input
        if (fileList !== undefined && fileList !== null && onLoad === false) {

            // cria um novo trajeto
            trajeto = { ...trajetoConstructor };
            misses = 0;
            percent = 0.01;
            iteracao = 1;
            iteracaoTotal = 0;

            progress.className = "progress";
            progressBar.className = "progress-bar progress-bar-striped progress-bar-success";
            progressBar.style = `width: ${Math.floor(percent * 100)}%`;
            progressBar.innerHTML = `${Math.floor(percent * 100)}%`;

            //Desabilita o  input de documentos enquanto carrega o loading
            inputElement.disabled = true;

            // Cria intervalos de iterações para carregar a progress Bar
            const loadTabu = setInterval(function executeTabuSearch() {
                onLoad = true;
                iteracaoTotal += parseInt(numIteracao / 100);

                while (iteracao < iteracaoTotal) {
                    buscaTabu();
                    iteracao++;

                    if (iteracao === parseInt(numIteracao * percent)) {
                        progressBar.style = `width: ${parseInt(percent * 100)}%`;
                        progressBar.innerHTML = `${Math.floor(percent * 100)}%`;
                        parseFloat(percent += 0.01).toFixed(2);
                    }

                    // Força sair de uma região ótima pelo numero de repetições de pioras
                    if (misses > trajeto.percurso.length ** 2 ) {
                        console.log(arrRes.distancia + " atual, e o novo é: "+ trajeto.distancia+" count: " +count + " misses: " + misses);
                        misses = 0;
                        arrRes = trajeto.distancia < arrRes.distancia ? { ...trajeto } : arrRes;
                        count++;
                        // Limpa o percurso mas mantendo a lista tabu
                        trajeto.distancia = Infinity;
                        trajeto.percurso = [];
                    }
                }

                if (iteracao >= numIteracao) {
                    console.log("Numero de Iterações = " + iteracaoTotal);
                    arrRes = trajeto.distancia < arrRes.distancia ? trajeto : arrRes;
                    let response = title;
                    response += '<br>';  
                    response += `Distância: ${arrRes.distancia}` 
                    response += '<br>';
                    response += `Melhor percurso encontrado: 1${arrRes.percurso.map(e => '->'+ parseInt(e+1)  )}`;
                    result.innerHTML = response.replaceAll(',','');
                    console.log(arrRes);
                    onLoad = false;
                    inputElement.disabled = false;
                    clearInterval(loadTabu);
                }
            }, 1);

        } else {
            // Mensagem de erros do botão ler
            if (onLoad === true) alert("Busca tabu em andamento, aguarde o carregamento!");
            else alert("Selecione um documento para ser lido no formato padrão!");
        }
    });


    // Fica ouvindo se há algum documento carregado
    inputElement.addEventListener("change", () => {

        // Limpa o array de documentos
        arrRes = { ...trajetoConstructor };

        // Limpa alguma progress bar existente
        progress.className = "";
        progressBar.className = "";
        progressBar.innerHTML = "";
        result.innerHTML = "";

        // função que lê arquivo do input
        function printFile(file) {
            let reader = new FileReader();
            reader.onload = function () {
                fileList = txtToArray(reader.result);
                const stringArrayToNumberArray =
                    (fileList !== null) ? fileList.map(val => val.map(element => (parseFloat(element).toFixed(1)))) : null;
                createTable(stringArrayToNumberArray, 'table-form');
            };
            reader.readAsText(file);
        }

        // Se não for null abre o arquivo do input
        if (inputElement.files[0] != null) {
            printFile(inputElement.files[0]);
        }
    });
})();
