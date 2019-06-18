$(document).ready(function () {

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const name = urlParams.get('nome');
    const uf = urlParams.get('uf');
    let numberOfCitys = 1;

    if (id) {
        $.ajax({
            type: 'GET',
            url: `http://servicos.cptec.inpe.br/XML/cidade/7dias/${id}/previsao.xml`,
            dataType: 'xml',
            success: (xml) => {
                afterClick(xml, name, uf);
            }
        });
    }

    $('#form-id').submit(function (event) {

        event.preventDefault();
        $('#content').html('');

        if ($('#search').val() != '') {

            $.ajax({
                type: 'GET',
                url: `http://servicos.cptec.inpe.br/XML/listaCidades?city=${formatInputToSearch($('#search').val())}`,
                dataType: 'xml',
                success: xml => {

                    let citys = [];

                    $(xml).find('cidades').find(`cidade`).each(function () {
                        citys.push({
                            nome: $(this).find('nome').text(),
                            id: $(this).find('id').text(),
                            uf: $(this).find('uf').text()
                        })
                    });

                    citys.forEach((element) => {
                        $.ajax({
                            type: 'GET',
                            url: `http://servicos.cptec.inpe.br/XML/cidade/7dias/${element.id}/previsao.xml`,
                            dataType: 'xml',
                            success: (xml) => {
                                $('<ul id="list"></ul>').appendTo('#content')
                                $(`<a href="?id=${element.id}&nome=${encodeURIComponent(element.nome)}&uf=${element.uf}" onclick="afterClick(xml,element.nome, element.uf)"></a><br/>`).html(`${element.nome} - ${element.uf}`).appendTo('#list');

                                numberOfCitys++;
                            }
                        })

                    })

                },
            });
        }
        $('#search').val('');
    });

    function formatInputToSearch(city) {
        return city.toLowerCase()
            .replace(/Ã|ã|â|Â|á|Á|à|ä|Ä/g, 'a')
            .replace(/é|É|è|È|ë|Ë|ê|Ê/g, 'e')
            .replace(/í|Í|î|Î|ï|Ï|ì|Ì/g, 'i')
            .replace(/õ|Õ|Ö|ö|ô|Ô|ó|Ó|Ò|ò/g, 'o')
            .replace(/ú|Ú|ù|Ù|Ü|ü|û|Û/g, 'u')
            .replace(/ç|Ç/g, 'c');
    }

    function afterClick(xml, city, state) {

        $(`<h1>${decodeURIComponent(city)} (${state})</h1>`).appendTo('#content');

        $(`<table class="table" id="table-${numberOfCitys}"></table>`)
            .html(`
                                <thead class="thead-dark">
                                    <tr>
                                    <th>Data</th>
                                    <th>Mínima</th>
                                    <th>Máxima</th>
                                    <th>IUV</th>
                                    <th>Tempo</th>
                                    </tr>
                                </thead>`).appendTo('#content');

        $(xml).find('cidade').find('previsao').each(function () {
            let day = $(this).find('dia').text();
            let min = $(this).find('minima').text();
            let max = $(this).find('maxima').text();
            let iuv = $(this).find('iuv').text();
            let weather = $(this).find('tempo').text();

            $('<tbody></tbody>')
                .html(
                    `<tr>
                        <td>${new Date(day.substring(0, 4), day.substring(5, 7) - 1, day.substring(8, 10)).toLocaleDateString()}</td>
                        <td>${min}ºC</td>
                        <td>${max}ºC</td>
                        <td>${iuv}</td>
                        <td>${weatherConditions(weather)}</td>
                    </tr>`)
                .appendTo(`#table-${numberOfCitys}`);

        });
    }

    function weatherConditions(a) {

        const acronyms = new Map([

            ["ec", "Encoberto com Chuvas Isoladas"],
            ["ci", "Chuvas Isoladas"],
            ["c", "Chuva"],
            ["in", "Instável"],
            ["pp", "Poss. de Pancadas de Chuva"],
            ["cm", "Chuva pela Manhã"],
            ["cn", "Chuva a Noite"],
            ["pt", "Pancadas de Chuva a Tarde"],
            ["pm", "Pancadas de Chuva pela Manhã"],
            ["np", "Nublado e Pancadas de Chuva"],
            ["pc", "Pancadas de Chuva"],
            ["pn", "Parcialmente Nublado"],
            ["cv", "Chuvisco"],
            ["ch", "Chuvoso"],
            ["t", "	Tempestade"],
            ["ps", "Predomínio de Sol"],
            ["e", "	Encoberto"],
            ["n", "Nublado"],
            ["cl", "Céu Claro"],
            ["nv", "Nevoeiro"],
            ["g", "Geada"],
            ["ne", "Neve"],
            ["nd", "Não Definido"],
            ["pnt", "Pancadas de Chuva a Noite"],
            ["psc", "Possibilidade de Chuva"],
            ["pcm", "Possibilidade de Chuva pela Manhã"],
            ["pct", "Possibilidade de Chuva a Tarde"],
            ["pcn", "Possibilidade de Chuva a Noite"],
            ["npt", "Nublado com Pancadas a Tarde"],
            ["npn", "Nublado com Pancadas a Noite"],
            ["ncn", "Nublado com Poss. de Chuva a Noite"],
            ["nct", "Nublado com Poss. de Chuva a Tarde"],
            ["ncm", "Nubl. c/ Poss. de Chuva pela Manhã"],
            ["npm", "Nublado com Pancadas pela Manhã"],
            ["npp", "Nublado com Possibilidade de Chuva"],
            ["vn", "Variação de Nebulosidade"],
            ["ct", "Chuva a Tarde"],
            ["ppn", "Poss. de Panc. de Chuva a Noite"],
            ["ppt", "Poss. de Panc. de Chuva a Tarde"],
            ["ppm", "Poss. de Panc. de Chuva pela Manhã"]

        ]);
        return acronyms.get(a);
    }
});
