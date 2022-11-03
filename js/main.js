import getTypeEffectiveness from "./type-effectiveness.js";
import POKEMON_DATA from "./pokemon-data.js";
import { POKEMON_RANGES, VERSION_TO_TYPE_CHART, TYPE_TO_NUM, NUM_TO_TYPE } from "./constants.js";


// cached element refs
const versionSelectElem = document.getElementById('version-select');
const type1Elem = document.getElementById('type1');
const type2Elem = document.getElementById('type2');
const type3Elem = document.getElementById('type3');
const type4Elem = document.getElementById('type4');
const fullyEvolvedElem = document.getElementById('fully-evolved');
const resultsDivElem = document.getElementById('results-go-here');
const optionsSteel = document.querySelectorAll('option[value="8"]');
const optionsDark = document.querySelectorAll('option[value="16"]');
const optionsFairy = document.querySelectorAll('option[value="17"]');

// attach event handlers
document.getElementById('calculate-button').addEventListener('click', handleCalculateButtonClick);
versionSelectElem.addEventListener('change', handleVersionChange);


function handleCalculateButtonClick(event) {
    // get current input states
    const version = versionSelectElem.value;
    const forceEvo = fullyEvolvedElem.checked;
    let types = [
        type1Elem.value,
        type2Elem.value,
        type3Elem.value,
        type4Elem.value
    ];
    // remove any "none"s
    types = types.filter(type => type !== 'none');
    // count and remove "any"s
    let typesAndAnysCount = types.length;
    types = types.filter(type => type !== 'any');
    let anyCount = typesAndAnysCount - types.length;
    // convert selected types to numbers
    types = types.map(type => parseInt(type));

    const numTypes = VERSION_TO_TYPE_CHART[version] === 'gen1' ? 15 : VERSION_TO_TYPE_CHART[version] === 'gen2' ? 17 : 18
    const typesAndSE = [];

    // this part is kept separate to abstract the logic from the number of "any"s
    function calculateAndAccumulate(types) {
        let effectiveness = calculate(types, version, forceEvo);
        const sumSE = effectiveness['2'] + effectiveness['4'];
        let typeComboStr = types.reduce((acc, typeNum) => `${acc} ${NUM_TO_TYPE[typeNum]}`, '');
        typesAndSE.push([typeComboStr, sumSE]);
    }
    
    // call calculate however many times, accumulating results, iterating through unselected types once for each "any" selected
    if (anyCount >= 1) {
        for (let moveType1 = 0; moveType1 < numTypes; moveType1++) {
            if (types.includes(moveType1)) continue;
            
            if (anyCount >= 2) {
                for (let moveType2 = moveType1 + 1; moveType2 < numTypes; moveType2++) {
                    if (types.includes(moveType2)) continue;

                    if (anyCount >= 3) {
                        for (let moveType3 = moveType2 + 1; moveType3 < numTypes; moveType3++) {
                            if (types.includes(moveType3)) continue;

                            if (anyCount >= 4) {
                                for (let moveType4 = moveType3 + 1; moveType4 < numTypes; moveType4++) {
                                    if (types.includes(moveType4)) continue;
                                    calculateAndAccumulate([...types, moveType1, moveType2, moveType3, moveType4]);
                                }
                            }
                            else {
                                calculateAndAccumulate([...types, moveType1, moveType2, moveType3]);
                            }
                        }
                    }
                    else {
                        calculateAndAccumulate([...types, moveType1, moveType2]);
                    }
                }
            }
            else {
                calculateAndAccumulate([...types, moveType1]);
            }
        }
    }
    else {
        calculateAndAccumulate(types);
    }

    // sort results, highest number of SE targets first
    typesAndSE.sort((a, b) => b[1] - a[1]);

    // display results
    resultsDivElem.innerHTML = typesAndSE.map(pair => `${pair[0]}: ${pair[1]}`).reduce((acc, line) => `${acc}${line}<br/>`, '');
}

function handleVersionChange(event) {
    if (VERSION_TO_TYPE_CHART[event.target.value] === 'gen1') {
        optionsSteel.forEach(option => { option.disabled = true; option.selected = false });
        optionsDark.forEach(option => { option.disabled = true; option.selected = false });
        optionsFairy.forEach(option => { option.disabled = true; option.selected = false });
    }
    else if (VERSION_TO_TYPE_CHART[event.target.value] === 'gen2') {
        optionsSteel.forEach(option => option.disabled = false);
        optionsDark.forEach(option => option.disabled = false);
        optionsFairy.forEach(option => { option.disabled = true; option.selected = false });
    }
    else if (VERSION_TO_TYPE_CHART[event.target.value] === 'gen6') {
        optionsSteel.forEach(option => option.disabled = false);
        optionsDark.forEach(option => option.disabled = false);
        optionsFairy.forEach(option => option.disabled = false);
    }
}


function calculate(moveTypes, version, forceEvo) {
    let results = {
        '0': 0,
        '0.25': 0,
        '0.5': 0,
        '1': 0,
        '2': 0,
        '4': 0,
    }
    POKEMON_RANGES[version].forEach(index => {
        let pokemon = POKEMON_DATA[index];
        if (forceEvo && pokemon.canEvolve[version]) return;
        let bestEffectiveness = moveTypes.reduce(
            (acc, moveType) => Math.max(getTypeEffectiveness(VERSION_TO_TYPE_CHART[version], moveType, pokemon.types[version]), acc),
            getTypeEffectiveness(VERSION_TO_TYPE_CHART[version], moveTypes[0], pokemon.types[version])
        )
        // Shedinja/Wonder Guard handling
        if (pokemon.name === 'shedinja' && bestEffectiveness < 2) {
            bestEffectiveness = 0;
        }
        results[bestEffectiveness.toString()]++;
    });
    return results;
}
