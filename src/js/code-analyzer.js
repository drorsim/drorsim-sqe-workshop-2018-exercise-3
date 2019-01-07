import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{range: true});
};

///////////////////////////////////////////////////////// my code starts here

let typeARR = [];
let nameARR = [];
let conditionARR = [];
let valueARR = [];
let varMapLet = [];
let inputMap = {};
let inputMapLet = [];
let nodes = [];
let vertexs = [];
let letMap = {};
let myCounter = 0;
////////////////
const mainfunc = (parsedCode,inputParsedCode) => {
    typeARR = [];
    nameARR = [];
    conditionARR = [];
    valueARR = [];
    let varMap = {};
    varMapLet = [];
    inputMap = {};
    inputMapLet = [];
    for(let i = 0; i < parsedCode.body.length; i++){
        LineInProgram(parsedCode.body[i],varMap);
    }
    return buildSub(parsedCode,inputParsedCode);
};

const buildSub = (parsedCode,inputParsedCode) => {
    //back the parsed code to string
    buildInputMap(inputParsedCode);
    let str = escodegen.generate(parsedCode);
    //let arr = str.split('\n');
    return str;
};

const LineInProgram = (parsedBlockOrLine,varMap) => {
    if(parsedBlockOrLine.type == 'FunctionDeclaration'){
        funcControl(parsedBlockOrLine,varMap);
    }
    else if(parsedBlockOrLine.type == 'ReturnStatement'){
        returnControl(parsedBlockOrLine,varMap);
    }
    else {
        LineInProgram2(parsedBlockOrLine,varMap);
    }
};

const LineInProgram2 = (parsedBlockOrLine,varMap) => {
    if(parsedBlockOrLine.type == 'ExpressionStatement'){
        expressionControl(parsedBlockOrLine.expression,varMap);
    }
    else  if(parsedBlockOrLine.type == 'IfStatement'){
        ifControl(parsedBlockOrLine,varMap);
    }
    else if(parsedBlockOrLine.type == 'VariableDeclaration'){
        for(let i = 0; i < parsedBlockOrLine.declarations.length; i++){
            varControl(parsedBlockOrLine.declarations[i],varMap);
        }
    }
    else{
        LineInProgram3(parsedBlockOrLine,varMap);
    }
};

const LineInProgram3 = (parsedBlockOrLine,varMap) => {
    if(parsedBlockOrLine.type == 'WhileStatement'){
        whileControl(parsedBlockOrLine,varMap);
    }
    else{
        BlockLine(parsedBlockOrLine,varMap);
    }
};

const BlockLine = (parsedBlockOrLine,varMap) => {
    let newVarMap = {};
    for(let i = 0; i < varMapLet.length; i++){
        newVarMap[varMapLet[i]] = varMap[varMapLet[i]];
    }
    for(let i = 0; i < parsedBlockOrLine.body.length; i++){
        LineInProgram(parsedBlockOrLine.body[i],newVarMap);
    }
};

const whileControl = (myLine,varMap) => {
    typeARR.push('While Statement');
    nameARR.push('');
    valueARR.push('');
    conditionARR.push(BinaryExpControl(myLine.test,varMap));
    LineInProgram(myLine.body,varMap);
};


const varControl = (parsedBlockOrLine,varMap) => {
    typeARR.push('Variable Declaration');
    nameARR.push(parsedBlockOrLine.id.name);
    conditionARR.push('');
    if(parsedBlockOrLine.init == null){
        valueARR.push('');
    }
    else{
        valueARR.push(myHelper(parsedBlockOrLine.init,varMap));
        varMap[parsedBlockOrLine.id.name] = buildNewVar(myHelper(parsedBlockOrLine.init,varMap),varMap);
        varMapLet.push(parsedBlockOrLine.id.name);
        parsedBlockOrLine = null;
    }
};

const funcControl = (parsedBlockOrLine,varMap) => {
    typeARR.push('Function Declaration');
    nameARR.push(parsedBlockOrLine.id.name);
    conditionARR.push('');
    valueARR.push('');
    for(let i = 0; i < parsedBlockOrLine.params.length; i++){
        typeARR.push('Variable Declaration');
        nameARR.push(parsedBlockOrLine.params[i].name);
        conditionARR.push('');
        valueARR.push('');
    }
    LineInProgram(parsedBlockOrLine.body,varMap);
};

const returnControl = (parsedBlockOrLine,varMap) => {
    typeARR.push('Return Statement');
    nameARR.push('');
    conditionARR.push('');
    if(parsedBlockOrLine.argument.type == 'Identifier'){
        valueARR.push(parsedBlockOrLine.argument.name);
        parsedBlockOrLine.argument.name = '('+switchIden(varMap,parsedBlockOrLine.argument.name)+')';
    }
    else if(parsedBlockOrLine.argument.type == 'Literal'){valueARR.push(parsedBlockOrLine.argument.raw);}
    else {returnComplexControl(parsedBlockOrLine,varMap);}

};

const returnComplexControl = (myLine,varMap) => {
    if(myLine.argument.type == 'UnaryExpression'){
        if(myLine.argument.argument.type == 'Identifier'){
            valueARR.push(myLine.argument.operator+' '+myLine.argument.argument.name);
            myLine.argument.argument.name = '('+switchIden(varMap,myLine.argument.argument.name)+')';
        }
        else if(myLine.argument.argument.type == 'Literal'){valueARR.push(myLine.argument.operator+' '+myLine.argument.argument.raw);}
    }
    else{
        valueARR.push(myHelper(myLine.argument,varMap));
    }
};

const expressionControl = (parsedBlockOrLine,varMap) => {
    if(parsedBlockOrLine.type == 'AssignmentExpression'){
        typeARR.push('Assignment Expression');
        nameARR.push(parsedBlockOrLine.left.name);
        if(varMapLet.includes(parsedBlockOrLine.left.name)){
            varMap[parsedBlockOrLine.left.name] = buildNewVar(myHelper(parsedBlockOrLine.right,varMap),varMap);
        }
        conditionARR.push('');
        valueARR.push(myHelper(parsedBlockOrLine.right,varMap));
    }
};

const myHelper = (myLine,varMap) => {
    let str='';
    if(myLine.type == 'BinaryExpression'){str+=BinaryExpControl(myLine,varMap);}
    else if(myLine.type == 'Identifier'){
        str+=myLine.name;
        myLine.name = '('+switchIden(varMap,myLine.name)+')';
    }
    //else if(myLine.type == 'MemberExpression'){str += memberControl(myLine,varMap);}
    //else if(myLine.type == 'UpdateExpression'){
    //    str += myLine.argument.name+myLine.operator;
    //}
    else{str+=myLine.raw;}
    return str;
};

const ifControl = (parsedBlockOrLine,varMap) => {
    typeARR.push('If Statement');
    nameARR.push('');
    valueARR.push('');
    conditionARR.push(BinaryExpControl(parsedBlockOrLine.test,varMap));
    LineInProgram(parsedBlockOrLine.consequent,varMap);
    if(parsedBlockOrLine.alternate != null){
        LineInProgram(parsedBlockOrLine.alternate,varMap);
    }
};

const BinaryExpControl = (myLine,varMap) => {
    let str = '';
    if(myLine.left.type == 'BinaryExpression'){str += BinaryExpControl(myLine.left,varMap);}
    else if(myLine.left.type == 'Identifier'){
        str += myLine.left.name;
        myLine.left.name = '('+switchIden(varMap,myLine.left.name)+')';
    }
    //else if(myLine.left.type == 'MemberExpression'){str += memberControl(myLine.left,varMap);}
    else {str += myLine.left.raw;}
    str += ' '+myLine.operator+' '+BinaryExpControlPart2(myLine,varMap);
    return str;
};

const BinaryExpControlPart2 = (myLine,varMap) => {
    let str = '';
    if(myLine.right.type == 'BinaryExpression'){return str+BinaryExpControl(myLine.right,varMap);}
    else if(myLine.right.type == 'Identifier'){
        myLine.right.name = '('+switchIden(varMap,myLine.right.name)+')';
        return str+myLine.right.name;
    }
    //else if(myLine.right.type == 'MemberExpression'){return str + memberControl(myLine.right,varMap);}
    else{return str+myLine.right.raw;}
};

/*const memberControl = (myLine,varMap) => {
    let str='';
    str += myLine.object.name + '[';
    if(myLine.property.type == 'Identifier'){
        myLine.property.name = '('+switchIden(varMap,myLine.property.name)+')';
        str += myLine.property.name;
    }
    else if(myLine.property.type == 'Literal'){str += myLine.property.raw;}
    else {str += BinaryExpControl(myLine.property,varMap);}
    str += ']';
    return str;
};*/

const buildNewVar = (term,varMap) => {
    for(let i = 0; i < varMapLet.length; i++){
        let broken = term.split(varMapLet[i]);
        if(broken.length > 1){
            let newValue = '';
            for(let j = 0; j < broken.length - 1; j++){
                newValue = newValue + broken[j] + varMap[varMapLet[i]];
            }
            newValue = newValue + broken[broken.length - 1];
            term = newValue;
        }
    }
    return term;
};

const switchIden = (varMap,term) =>{
    if(varMapLet.includes(term)){
        term = varMap[term];
    }
    return term;
};

const buildInputMap = (input) => {
    if(input.body.length == 1){
        if(input.body[0].type == 'VariableDeclaration'){
            for(let i = 0; i < input.body[0].declarations.length; i++){
                if(input.body[0].declarations[i].init != null){
                    inputMap[input.body[0].declarations[i].id.name] = input.body[0].declarations[i].init.raw;
                    inputMapLet.push(input.body[0].declarations[i].id.name);
                }
            }
        }
    }
};
//////////////////////////////////////////////////////////////change shape
function DrawAllG(dot,inputParsedCode,str){
    dot = cleanGraph(dot);
    dot = changeShape(dot);
    dot = DrawG(dot,inputParsedCode,str);
    return dot;
}


function cleanGraph(graph){
    let lines = graph.split('\n');
    let newGraph = '';
    for(let i = 0; i <lines.length; i++){
        if(lines[i].indexOf('exception') == -1){
            newGraph = newGraph + lines[i] + '\n';
        }
    }
    //return deleteEntryExit(newGraph);
    return newGraph;
}

function changeShape(dot) {
    let splitDot = dot.split('\n');
    for(let i = 1; i < splitDot.length; i++){
        let myVar = isSquare(splitDot[i]);
        if(myVar == 'd'){
            splitDot[i] = splitDot[i].replace(']',', shape = "diamond"]');
        }
        else if(myVar == 's'){
            splitDot[i] = splitDot[i].replace(']',', shape = "square"]');
        }
    }
    return buildDot(splitDot);
}

function isSquare(str){
    if(!str.includes('->')){
        return isSquareS(str);
    }
    else return isSquare2(str);
}
function isSquareS(str){
    if(str.includes('<') || str.includes('>') || str.includes('==') || str.includes('!=')){
        return 'd';
    }
    else return isSquare2(str);
}

function isSquare2(str) {
    if(!str.includes('->') && !str.includes('style')){
        return 's';
    }
}

function buildDot(dotSplitted){
    let newDot = '';
    for (let i = 0; i < dotSplitted.length; i++){
        newDot = newDot + dotSplitted[i] + '\n';
    }
    return newDot;
}

/////////////////////////////////////////////////////////////////////// draw graph

function DrawG(dot,inputParsedCode,symbolic) {
    symbolic = symbolic.split('\n'); myCounter = 0;
    if(inputParsedCode.body.length > 0){
        inputMap = {};inputMapLet = [];letMap = {};
        buildInputMap(inputParsedCode);
        letMap = createMap(symbolic);
        nodes = [];vertexs = [];
        let dotsplit = dot.split('\n');
        nodes.push('n0');
        for(let i = 1; i < dotsplit.length-3; i++){
            if(dotsplit[i].includes('->')) vertexs.push(dotsplit[i]);
            else nodes.push(dotsplit[i]);
        }
        let nodesLabels = createNodeLabel(nodes);
        let moveIndex = createMoveIndex(vertexs,nodesLabels.length);
        let greenLines = move(moveIndex,nodesLabels);
        return buildDotS(dotsplit,greenLines,nodesLabels.length);
    }
    else return dot;
}


function buildDotS(dotsplit,greeLines,n_nodes) {
    for(let i = 0; i < n_nodes; i++){
        if(greeLines.includes(i.toString())){
            dotsplit[i] = dotsplit[i].replace(']',', color = "green"]');
        }
    }
    return buildDot(dotsplit);
}

function createNodeLabel(nodes) {
    let arr = [];
    arr.push('entry');
    for(let i = 1; i < nodes.length; i++){
        arr.push(nodes[i].split('label="')[1].split('"')[0]);
    }
    return arr;
}

function createMap(symbolic){
    let Map = {};
    for(let i = 0; i < symbolic.length; i++){
        if(symbolic[i].includes('let')){
            let key = symbolic[i].split(' = ')[0].substring(8);
            let val = symbolic[i].split(' = ')[1].substring(-3,symbolic[i].split(' = ')[1].length-1);
            Map[key] = val;
        }
    }
    return Map;
}

function myreplace(str){
    for(var key in letMap){
        if(str.includes(key)) str = str.replace(key,letMap[key]);
    }
    for(var keyS in inputMap){
        if(str.includes(keyS)) str = str.replace(keyS,inputMap[keyS]);
    }
    return getColor(str);
}
function getColor(str){
    if(eval(str) && myCounter < 20){
        return 'green';
    }
    return 'red';
}


function move(moveIndex,nodeLabels){
    let greenIndex = []; let temp = '0'; let flag = true;
    while(flag){
        if(!greenIndex.includes(temp)) greenIndex.push(temp);
        if(moveIndex[temp].length == 1){
            //if(!greenIndex.includes(temp)) greenIndex.push(temp);
            temp = moveIndex[temp][0];
        }
        else if(moveIndex[temp].length == 0){
            //if(!greenIndex.includes(temp)) greenIndex.push(temp);
            flag = false;
        }
        else{
            //if(!greenIndex.includes(temp)) greenIndex.push(temp);
            temp = findnewtemp(moveIndex,nodeLabels,temp);
        }
        myCounter = myCounter + 1;
    }
    return greenIndex;
}



function findnewtemp(moveIndex,nodeLabels,temp) {
    if(myreplace(nodeLabels[parseInt(temp)]) == 'green') return moveIndex[temp][0];
    return moveIndex[temp][1];
}

function createMoveIndex(vertexs,n_nodes){
    let moveIndex = {};
    for(let i = 0; i < n_nodes; i++){
        moveIndex[i.toString()] = [];
        for(let j = 0; j < vertexs.length; j++){
            if(vertexs[j].split(' -> ')[0].includes(i.toString())) moveIndex[i.toString()].push(vertexs[j].split(' -> ')[1].split(' ')[0].substring(1));
        }
    }
    return moveIndex;

}

///////////////////////////////////////////////////////////////////
export {parseCode,mainfunc,cleanGraph,changeShape,DrawG,DrawAllG};

