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
const optionsPhysical = document.querySelectorAll('option[value="physical"]');
const optionsSpecial = document.querySelectorAll('option[value="special"]');
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
    let movesCount = types.length;
    types = types.filter(type => type !== 'any');
    let anyCount = movesCount - types.length;
    // count and remove "physical"s
    types = types.filter(type => type !== 'physical');
    let physicalCount = movesCount - anyCount - types.length;
    // count and remove "special"s
    types = types.filter(type => type !== 'special');
    let specialCount = movesCount - anyCount - physicalCount - types.length;
    // convert selected types to numbers
    types = types.map(type => parseInt(type));

    // cheat at number of types in gen 1, skip steel in processMultiOptions
    const numTypes = VERSION_TO_TYPE_CHART[version] === 'gen1' ? 16 : VERSION_TO_TYPE_CHART[version] === 'gen2' ? 17 : 18
    const typesAndSE = [];

    // this part is kept separate to abstract the logic from the number of "any"s
    function calculateAndAccumulate(types) {
        let effectiveness = calculate(types, version, forceEvo);
        const sumSE = effectiveness['2'] + effectiveness['4'];
        let typeComboStr = types.reduce((acc, typeNum) => `${acc} ${NUM_TO_TYPE[typeNum]}`, '');
        typesAndSE.push([typeComboStr, sumSE]);
    }
    
    function processMultiOptions(anys, physicals, specials, cursors) {
        let lastCursor = cursors.length === 0 ? -1 : cursors[cursors.length - 1]

        if (anys > 0) {
            for (let moveType = lastCursor + 1; moveType < numTypes; moveType++) {
                if (numTypes === 16 && moveType === 8) continue; // skip steel in gen 1
                if (types.includes(moveType)) continue;
                processMultiOptions(anys - 1, physicals, specials, [...cursors, moveType]);
            }
        }
        else if (physicals > 0) {
            if (lastCursor > 8) lastCursor = -1; // when an any loop is on the specials, start physicals loop at normal (0)
            for (let moveType = lastCursor + 1; moveType < (numTypes === 16 ? 8 : 9); moveType++) {
                if (types.includes(moveType)) continue;
                processMultiOptions(anys, physicals - 1, specials, [...cursors, moveType]);
            }
        }
        else if (specials > 0) {
            // ignoring fairy for now since it can never come up
            for (let moveType = Math.max(9, lastCursor + 1); moveType < (numTypes === 16 ? 16 : 17); moveType++) {
                if (types.includes(moveType)) continue;
                processMultiOptions(anys, physicals, specials - 1, [...cursors, moveType]);
            }
        }
        else calculateAndAccumulate([...types, ...cursors]);
    }

    processMultiOptions(anyCount, physicalCount, specialCount, []);

    // sort results, highest number of SE targets first
    typesAndSE.sort((a, b) => b[1] - a[1]);

    // display results
    resultsDivElem.innerHTML = typesAndSE.map(pair => `${pair[0]}: ${pair[1]}`).reduce((acc, line) => `${acc}${line}<br/>`, '');
}

function handleVersionChange(event) {
    // enable/disable dark/steel/fairy types
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

    // enable/disable the physical/special options, because they're only relevant for gens 1-3
    if (event.target.value === 'red-blue' || event.target.value === 'gold-silver' || event.target.value === 'ruby-sapphire') {
        optionsPhysical.forEach(option => option.disabled = false);
        optionsSpecial.forEach(option => option.disabled = false);
    }
    else {
        optionsPhysical.forEach(option => { option.disabled = true; option.selected = false });
        optionsSpecial.forEach(option => { option.disabled = true; option.selected = false });
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
