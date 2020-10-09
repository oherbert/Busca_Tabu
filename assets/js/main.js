let fileList;

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

    if (trajeto.percurso.length === 0) {
        for (let i = 1; i < fileList.length; i++) { trajeto.percurso.push(i) };
        trajeto.percurso.push(0);
    } else {
        let newTabu = false;

        do {
            let swap1 = Math.round(Math.random() * (trajeto.percurso.length - 2) + 1);
            let swap2 = Math.round(Math.random() * (trajeto.percurso.length - 2) + 1);

            if (swap1 != swap2) {
                const tabu = [swap1, swap2];

                if (trajeto.listaTabu.length === 0) trajeto.listaTabu.push(tabu);
                    
                for (let i = 0; i < trajeto.listaTabu.length; i++) {
                    if (tabu === trajeto.listaTabu[i]) break;

                    if (trajeto.listaTabu.length - 1 === i) {
                        trajeto.listaTabu[0] = tabu;
                        newTabu = true;
                    }
                }
                console.log(tabu);
            }
        } while (newTabu !== true);

    }

    const percursoI = [...trajeto.percurso];
    let distanciaI = 0;

    fileList.forEach(e => {
        const next = percursoI.shift();
        distanciaI += parseFloat(e[next]);
    });

    if (trajeto.distancia === 0) trajeto.distancia = distanciaI;

    trajeto.distancia = trajeto.distancia > distanciaI ? distanciaI : trajeto.distancia;

    return trajeto;
}


// Função principal que executa a logica do simplex 
const main = (() => {
    const btnLer = document.querySelector('.ler');

    // Adiciona o Listener na função submit do botão Ler
    btnLer.addEventListener('click', event => {
        event.preventDefault();

        // Verifica se há um documento no input
        if (fileList !== undefined && fileList !== null) {

            let trajeto = {
                distancia: 0,
                percurso: [],
                listaTabu: []
            };




            let iteracao = 1;
            while (iteracao < 30) {
                trajeto = buscaTabu(trajeto);
                //console.log(trajeto);
                iteracao++;
            }

            console.log(trajeto);

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
