$(document).ready(function(){

    $("#regionSelecter").prop("disabled", true);
    $("#showButton").prop("disabled", true);

    // API-симуляция, получаем данные
    let branchesAndRegions = getBranchesAndRegions();
    
    // Заполняем филиал-select
    Object.values(branchesAndRegions).forEach(val => {
        $("#branchOfficeSelecter").append(new Option(val.branchName, val.branchCode));
    });

    // Если меняем филиал, то ->
    $("#branchOfficeSelecter").change(function() {
        // -> меняются и регионы
        // конктерно тут очистка
        $("#regionSelecter").children().remove();

        let branchCode = $('#branchOfficeSelecter option:selected').val();
        
        if( branchCode != "defaultTitle") {
            $("#regionSelecter").prop("disabled", false);
            $("#showButton").prop("disabled", false);

            let regionsFromSelectedBranch = branchesAndRegions[branchCode].regions;
            
            Object.values(regionsFromSelectedBranch).forEach(val => {
                $("#regionSelecter").append(new Option(val.name, val.code));
            });
        
        } else {
            $("#regionSelecter").prop("disabled", true);
            $("#showButton").prop("disabled", true);
        }
    });

    $("#showButton").click(function() {
        // Получаем код региона
        let selectedRegionCode = $('#regionSelecter option:selected').val();
        
        // И тут API-симуляция
        let objectsByRegionCode = getObjectsByRegionCode(selectedRegionCode)[selectedRegionCode];
        
        let result = {};
        for (let index = 0; index < objectsByRegionCode.length; index++) {
            let element = objectsByRegionCode[index];
            
            if (typeof result[element.vendor] !== "undefined") {
                // Если вендор уже попадался то увеличиваем на 1
                switch (element.status) {
                    case 'ACTIVE':
                        result[element.vendor]['active']++
                        break;
                
                    case 'DISABLE':
                        result[element.vendor]['disable']++;
                        break;
                }               
            } else {
                // Тут инициализация первого элемента нового попавшегося вендора
                switch (element.status) {
                    case 'ACTIVE':
                        result[element.vendor] = {active: 1, disable: 0};
                        break;
                
                    case 'DISABLE':
                        result[element.vendor] = {active: 0, disable: 1};
                        break;
                }
            }
        }

        // Просто сортируем по ключу
        const orderedResult = {};
        Object.keys(result).sort().forEach(function(key) {
            orderedResult[key] = result[key];
        });

        $('#containerForCards').children().remove();

        for (var k in orderedResult){
            $('#containerForCards').append(getCardForVendor(k, orderedResult[k]));
        }
    });
});

function getCardForVendor(venderName, vendorData) {
    let resultElement = $('<div>', {
        'class': 'card',
        'style': 'margin: 1% 0'
    }).append($('<div>', {
        'class': 'card-body'
    }).append($('<h4>', {
             'class': 'card-title',
             text: venderName
         })).append($('<span>', {
                 'class': 'card-link',
                 text: "Количество активных объектов: " + vendorData.active
             })).append($('<span>', {
                     'class': 'card-link',
                     text: "Количество отключённых объектов: " + vendorData.disable
                 }))); 

    return resultElement;
}

function getBranchesAndRegions() {
    return {
        CN: {
            branchCode: 'CN', //код филиала 
            branchName: 'Центральный филиал',//Имя филиала 
            regions: [ //список регионов внутри филиала
                {name: 'Брянская область', code: 32}, //name: имя региона, code: код региона
                {name: 'Владимирская область', code: 33},
                {name: 'Калужская область', code: 40},
                {name: 'Курская область', code: 46},
            ]
        },
        KV: {
            branchCode: 'KV',
            branchName: 'Кавказский филиал',
            regions: [
                {name: 'Республика Адыгея', code: 1},
                {name: 'Республика Дагестан', code: 5},
                {name: 'Краснодарский край', code: 23},
                {name: 'Воронежская область', code: 36},
            ]
        },
    }
}

function getObjectsByRegionCode(regionCode){
    let vendorList = ['HUAWEI', 'ZTE', 'NOKIA']
    let statusList = ['ACTIVE', 'DISABLE']
    let response = {}
    let gri = (max) => {
        return Math.floor(Math.random() * Math.floor(max))
    }
    response[regionCode] = []
    for(let i = 0; i < 100; i++){
        response[regionCode].push({ vendor: vendorList[gri(3)], name: 'CELL_'+(gri(999)+1000)+'_'+gri(9), status: statusList[gri(2)]})
    }

    return response;
}
