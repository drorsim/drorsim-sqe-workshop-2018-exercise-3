import $ from 'jquery';
import {parseCode,mainfunc,DrawAllG} from './code-analyzer';
import Viz from 'viz.js';
import * as esgraph from 'esgraph';
import {Module,render} from 'viz.js/full.render.js';


$(document).ready(function(){
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val(); let parsedCode = parseCode(codeToParse);
        let inputCodeToParse = $('#codePlaceholder2').val();
        let inputParsedCode = parseCode(inputCodeToParse);
        let str = mainfunc(parsedCode,inputParsedCode);
        let cfg = esgraph(parsedCode['body'][0]['body']);
        let dot = 'digraph{' + esgraph.dot(cfg, {source: codeToParse}) + '}';
        dot = DrawAllG(dot,inputParsedCode,str);
        let graphElement = document.getElementById('parsedCode2');
        let viz = new Viz({Module,render});
        viz.renderSVGElement(dot)
            .then(function (element) {
                graphElement.innerHTML = '';
                graphElement.append(element);
            });
    });
});
