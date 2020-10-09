let fileList;
let iteracaoTotal = 0;
let arrRes = null;

// Método para comparar 2 Arrays
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



// Função que cria a tabela dentro da div do html
const createTable = (array, className) => {
    const divForm = document.querySelector('.divForm');

    // console.log(array);

    // Limpa O formulário ao carregar o arquivo 
    if (className === 'table') {
        while (divForm.children.length > 0) {
            divForm.removeChild(divForm.lastChild);
        }
    }

    if (array !== null) {

        const table = document.createElement('table');
        table.className = className;

        let t = '';
        t += array.map(element => `<tr class="row"> ${element.map(e => `<td class="data"> ${e} </td>`)} </tr>`);
        t = t.replaceAll(',', '')
        //console.log(t);
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
        // if (linha.indexOf("COMMENT") >= 0) array.push(linha.substr(linha.indexOf(':') + 2));

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
    for (let element of array) {
        let a = element.shift();
        let b = element.shift();
        element.push((a - b) ** 2);
    }

    const newArray = [];

    array.forEach((e, i) => {
        const subArray = [];
        //console.log(e);

        array.map((elm, ii) => subArray.push(i === ii ? 0.0 : Math.sqrt((parseFloat(e) + parseFloat(elm)))));

        newArray.push(subArray);
    });

    //newArray.map(e => console.log(e));
    return newArray;
}

const buscaTabu = trajeto => {

    const percursoI = (trajeto.percurso.length > 0)?[...trajeto.percurso]:[];
    let distanciaI = 0;

    if (percursoI.length === 0) {
        for (let i = 1; i < fileList.length; i++) { percursoI.push(i) };
        percursoI.push(0);
    } else {
        let newTabu = false;

        do {
            let swap1 = Math.round(Math.random() * (trajeto.percurso.length - 3) + 0);
            let swap2 = Math.round(Math.random() * (trajeto.percurso.length - 3) + 0);

            if (swap1 != swap2) {
                const tabu = [swap1, swap2];

                if (trajeto.listaTabu.length === 0) {
                    percursoI.splice(swap1, 0, percursoI.splice(swap2, 1)[0]);
                    trajeto.listaTabu.push(tabu);
                    break;
                }

                for (let i = 0; i < trajeto.listaTabu.length; i++) {
                    const tabuA = trajeto.listaTabu[i];
                    const tabuI = [...tabu];

                    if (tabu.equals(tabuA) || tabuI.reverse().equals(tabuA)) break;


                    if (trajeto.listaTabu.length - 1 === i) {
                        //console.log(tabu);
                        tabuA.push(tabu);
                        percursoI.splice(swap1, 0, percursoI.splice(swap2, 1)[0]);

                        //Remove elementos da lista tabu
                        if (tabuA.length > trajeto.percurso.length  * 4 ){
                            const a = tabuA.shift();
                            //console.log(a);
                            }
                        newTabu = true;
                    }
                }
            }
        } while (newTabu !== true);

    }

  //  console.log(percursoI);

    let passo = 0;
    for(let i=0; i< fileList.length; i++) {
        const next = percursoI[i];
        distanciaI += parseFloat(fileList[passo][next]);
        passo = next;
    };



    if (trajeto.distancia === 0) {
        trajeto.distancia = parseFloat(distanciaI).toFixed(2);
        trajeto.percurso = percursoI;
       // console.log(trajeto);
    }

    if (trajeto.distancia > distanciaI) {
        trajeto.distancia = parseFloat(distanciaI).toFixed(2);
        //console.log(trajeto.distancia);
        trajeto.percurso = percursoI;
    }

    return trajeto;
}


// Função principal que executa a logica do simplex 
const main = (() => {
    const btnLer = document.querySelector('.ler');


    // Adiciona o Listener na função submit do botão Ler
    btnLer.addEventListener('click', event => {
        event.preventDefault();

        let trajeto = {
            distancia: -Math.max(),
            percurso: [],
            listaTabu: []
        };

        // Verifica se há um documento no input
        if (fileList !== undefined && fileList !== null) {


            let iteracao = 1;
            while (iteracao < 100000) {
                trajeto = buscaTabu(trajeto);
                iteracao++;
            }

            iteracaoTotal+=iteracao;
            console.log("Numero de Iterações = " + iteracaoTotal);
            arrRes = arrRes === null?trajeto: arrRes; 
            arrRes = trajeto.distancia < arrRes.distancia? trajeto: arrRes;
            
            console.log(arrRes);

        } else alert("Selecione um documento para ser lido no formato padrão.");
    });

    // Fica ouvindo se há algum documento carregado
    const inputElement = document.getElementById("input");
    inputElement.addEventListener("change", () => {

        // função que lê arquivo do input
        function printFile(file) {
            let reader = new FileReader();
            reader.onload = function () {
                fileList = txtToArray(reader.result);
                const stringArrayToNumberArray =
                    (fileList !== null) ? fileList.map(val => val.map(element => (parseFloat(element).toFixed(1)))) : null;
                createTable(stringArrayToNumberArray, 'table');
            };
            reader.readAsText(file);
        }

        // Se não for null abre o arquivo do input
        if (inputElement.files[0] != null) {
            printFile(inputElement.files[0]);
        }

    });

})();
