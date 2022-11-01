// generate an array of integers from start to end, inclusive
function range(start, end) {
    return [...Array(end - start + 1).keys()].map(x => x + start);
}

const POKEMON_RANGES = {
    'red-blue': range(0, 150),
    'gold-silver': range(0, 250),
    'ruby-sapphire': range(0, 385),
    'diamond-pearl': range(0, 492),
    'platinum': range(0, 492).concat(range(807, 812), range(814, 818)),
    'black-white': range(0, 648).concat(range(807, 824)),
    'black-2-white-2': range(0, 648).concat(range(807, 829)),
    'x-y': range(0, 720).concat(range(807, 869)),
    'omega-ruby-alpha-sapphire': range(0, 720).concat(range(807, 885), range(892, 896)),
    'sun-moon': range(0, 801).concat(range(807, 885), range(892, 898), range(906, 921), 923, 924, 926, range(929, 933), 942),
    'ultra-sun-ultra-moon': range(0, 885).concat(range(892, 898), range(906, 921), 923, 924, 926, range(929, 933), 942, 958, range(961, 963)),
    'renegade-platinum': range(0, 492).concat(range(807, 812), range(814, 818)), // same as platinum
}

const VERSION_TO_TYPE_CHART = {
    'red-blue': 'gen1',
    'gold-silver': 'gen2',
    'ruby-sapphire': 'gen2',
    'diamond-pearl': 'gen2',
    'platinum': 'gen2',
    'black-white': 'gen2',
    'black-2-white-2': 'gen2',
    'x-y': 'gen6',
    'omega-ruby-alpha-sapphire': 'gen6',
    'sun-moon': 'gen6',
    'ultra-sun-ultra-moon': 'gen6',
    'renegade-platinum': 'gen6',
}

const TYPE_TO_NUM = {
    'normal': 0,
    'fighting': 1,
    'flying': 2,
    'poison': 3,
    'ground': 4,
    'rock': 5,
    'bug': 6,
    'ghost': 7,
    'steel': 8,
    'fire': 9,
    'water': 10,
    'grass': 11,
    'electric': 12,
    'psychic': 13,
    'ice': 14,
    'dragon': 15,
    'dark': 16,
    'fairy': 17
}

const NUM_TO_TYPE = Object.keys(TYPE_TO_NUM);

export {
    POKEMON_RANGES,
    VERSION_TO_TYPE_CHART,
    TYPE_TO_NUM,
    NUM_TO_TYPE
}
