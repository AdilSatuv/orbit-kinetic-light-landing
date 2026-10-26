export const finishes={copper:{label:'Медь',color:'#b86543',metalness:.77,roughness:.3},chalk:{label:'Мел',color:'#e5ded1',metalness:.12,roughness:.65},ink:{label:'Графит',color:'#353641',metalness:.65,roughness:.35}};
export const temperatures={warm:{label:'Тёплый',value:'2700 K',color:'#ffd7a0'},neutral:{label:'Нейтральный',value:'4000 K',color:'#f4f1e9'}};
export const poses={open:{label:'Раскрытая',angle:1.05},quiet:{label:'Спокойная',angle:.4},sculpture:{label:'Скульптурная',angle:1.52}};
export const defaultConfig={finish:'copper',temperature:'warm',pose:'open'};
export function normalizeConfig(input={}){return {finish:Object.hasOwn(finishes,input.finish)?input.finish:defaultConfig.finish,temperature:Object.hasOwn(temperatures,input.temperature)?input.temperature:defaultConfig.temperature,pose:Object.hasOwn(poses,input.pose)?input.pose:defaultConfig.pose};}
export function readConfig(search=''){const p=new URLSearchParams(search);return normalizeConfig(Object.fromEntries(Object.keys(defaultConfig).map(key=>[key,p.getAll(key).length===1?p.get(key):undefined])));}
export function configSearch(config){return new URLSearchParams(normalizeConfig(config)).toString();}
export function configText(config){const c=normalizeConfig(config);return `ORBIT / световой объект\nОтделка: ${finishes[c.finish].label}\nСвет: ${temperatures[c.temperature].label} / ${temperatures[c.temperature].value}\nКомпозиция: ${poses[c.pose].label}\n\nУчебный дизайн-концепт. Не заказ, не спецификация серийного изделия. Температура показана иллюстративно.\n`;}
