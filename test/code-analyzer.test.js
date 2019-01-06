import assert from 'assert';
import {parseCode, mainfunc, DrawAllG} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing a simple var dec correctly', () => {
        assert.equal(
            mainfunc(parseCode('function test1(x,y){\n' +
                '    if(x == y){\n' +
                '       x = x + 1;\n' +
                '    }\n' +
                '    else{ \n' +
                '        y = y + 1;\n' +
                '    }\n' +
                '}'),parseCode('let x = 1, y = 2;')),
            'function test1(x, y) {\n' +
            '    if ((x) == (y)) {\n' +
            '        x = (x) + 1;\n' +
            '    } else {\n' +
            '        y = (y) + 1;\n' +
            '    }\n' +
            '}'
        );
    });
    it('is parsing a example 1', () => {
        assert.equal(
            mainfunc(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n'),parseCode('let x = 1, y = 2, z = 3;')),
            'function foo(x, y, z) {\n' +
            '    let a = ((x)) + 1;\n' +
            '    let b = (((x) + 1)) + ((y));\n' +
            '    let c = 0;\n' +
            '    if ((((x) + 1) + ((y))) < (z)) {\n' +
            '        c = ((0)) + 5;\n' +
            '        return (x) + (y) + (z) + (0 + 5);\n' +
            '    } else if ((((x) + 1) + ((y))) < (z) * 2) {\n' +
            '        c = ((0)) + ((x)) + 5;\n' +
            '        return (x) + (y) + (z) + (0 + (x) + 5);\n' +
            '    } else {\n' +
            '        c = ((0)) + ((z)) + 5;\n' +
            '        return (x) + (y) + (z) + (0 + (z) + 5);\n' +
            '    }\n' +
            '}'
        );
    });
    it('test3', () => {
        assert.equal(
            mainfunc(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    while (a < z) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return z;\n' +
                '}'),parseCode('let x = 1, y = 2, z = 3;')),
            'function foo(x, y, z) {\n' +
            '    let a = ((x)) + 1;\n' +
            '    let b = (((x) + 1)) + ((y));\n' +
            '    let c = 0;\n' +
            '    while (((x) + 1) < (z)) {\n' +
            '        c = (((x) + 1)) + ((((x) + 1) + ((y))));\n' +
            '        z = ((x) + 1 + (((x) + 1) + ((y)))) * 2;\n' +
            '    }\n' +
            '    return (z);\n' +
            '}'
        );
    });
    it('test4', () => {
        assert.equal(
            mainfunc(parseCode('function test(x,y){\n' +
                '    if(x == y){\n' +
                '        return -1\n' +
                '    }\n' +
                '    else if(x > y){\n' +
                '        return -x\n' +
                '    }\n' +
                '    else{\n' +
                '        return -y\n' +
                '    }\n' +
                '}'),parseCode('let x = 1, y = 2;')),
            'function test(x, y) {\n' +
            '    if ((x) == (y)) {\n' +
            '        return -1;\n' +
            '    } else if ((x) > (y)) {\n' +
            '        return -(x);\n' +
            '    } else {\n' +
            '        return -(y);\n' +
            '    }\n' +
            '}'
        );
    });
    it('test5', () => {
        assert.equal(
            mainfunc(parseCode('function test(x,y){\n' +
                '    if(x == y){\n' +
                '        return 1\n' +
                '    }\n' +
                '    else if(x > y){\n' +
                '        return -x\n' +
                '    }\n' +
                '    else{\n' +
                '        return y\n' +
                '    }\n' +
                '}'),parseCode('let x = 1, y = 2;')),
            'function test(x, y) {\n' +
            '    if ((x) == (y)) {\n' +
            '        return 1;\n' +
            '    } else if ((x) > (y)) {\n' +
            '        return -(x);\n' +
            '    } else {\n' +
            '        return (y);\n' +
            '    }\n' +
            '}'
        );
    });
    it('test6', () => {
        assert.equal(
            mainfunc(parseCode('function swipe(x,y){\n' +
                '    let temp  = x;\n' +
                '    x = y;\n' +
                '    y = temp;\n' +
                '}'),parseCode('let x = 1, y = 2;')),
            'function swipe(x, y) {\n' +
            '    let temp = ((x));\n' +
            '    x = (y);\n' +
            '    y = ((x));\n' +
            '}'
        );
    });
    it('test7', () => {
        assert.equal(
            mainfunc(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = 2*a + y;\n' +
                '    let c = 0;\n' +
                '\n' +
                '    while(c < 10){\n' +
                '        c = c + 1;\n' +
                '    }\n' +
                '\n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } \n' +
                '    else {\n' +
                '        c = c + z + 5 + a + b;\n' +
                '        return 20*c;\n' +
                '    }\n' +
                '}'),parseCode('let x = 1, y = 2, z = 3;')),
            'function foo(x, y, z) {\n' +
            '    let a = ((x)) + 1;\n' +
            '    let b = 2 * (((x) + 1)) + ((y));\n' +
            '    let c = 0;\n' +
            '    while ((0) < 10) {\n' +
            '        c = ((0)) + 1;\n' +
            '    }\n' +
            '    if ((2 * (((x) + 1)) + ((y))) < (z)) {\n' +
            '        c = ((0)) + 5;\n' +
            '        return (x) + (y) + (z) + (0 + 5);\n' +
            '    } else {\n' +
            '        c = ((0)) + ((z)) + 5 + (((x) + 1)) + ((2 * (((x) + 1)) + ((y))));\n' +
            '        return 20 * (0 + (z) + 5 + ((x) + 1) + (2 * (((x) + 1)) + ((y))));\n' +
            '    }\n' +
            '}'
        );
    });
    it('test8', () => {
        assert.equal(
            mainfunc(parseCode('function test(x,y){\n' +
                '    if(x + y < 10){\n' +
                '        return 10;\n' +
                '    }\n' +
                '    else if(x - y > 20){\n' +
                '        return -20;\n' +
                '    }\n' +
                '    else if(x + y > 20){\n' +
                '        return 6 + x + y;\n' +
                '    }\n' +
                '    else{\n' +
                '        return x - y + 5;\n' +
                '    }\n' +
                '}'),parseCode('let x = 14, y = 3;')),
            'function test(x, y) {\n' +
            '    if ((x) + (y) < 10) {\n' +
            '        return 10;\n' +
            '    } else if ((x) - (y) > 20) {\n' +
            '        return -20;\n' +
            '    } else if ((x) + (y) > 20) {\n' +
            '        return 6 + (x) + (y);\n' +
            '    } else {\n' +
            '        return (x) - (y) + 5;\n' +
            '    }\n' +
            '}'
        );
    });
    it('test9', () => {
        assert.equal(
            mainfunc(parseCode('function test(x,y){\n' +
                '    while(x < y){\n' +
                '        x = x + 1;\n' +
                '    }\n' +
                '    if(y < 10){\n' +
                '        y = 20;\n' +
                '    }\n' +
                '    return x;\n' +
                '}'),parseCode('let x = 14, y = 3;')),
            'function test(x, y) {\n' +
            '    while ((x) < (y)) {\n' +
            '        x = (x) + 1;\n' +
            '    }\n' +
            '    if ((y) < 10) {\n' +
            '        y = 20;\n' +
            '    }\n' +
            '    return (x);\n' +
            '}'
        );
    });
    it('test10', () => {
        assert.equal(
            mainfunc(parseCode('function test(x,y){\n' +
                '    let a = x;\n' +
                '    let b = y;\n' +
                '    let c = a + b;\n' +
                '    while(a < b){\n' +
                '        a = a + 1;\n' +
                '    }\n' +
                '    if(a > c){\n' +
                '        return c;\n' +
                '    }\n' +
                '    else{\n' +
                '        return b;\n' +
                '    }\n' +
                '}'),parseCode('let x = 5, y = 10;')),
            'function test(x, y) {\n' +
            '    let a = ((x));\n' +
            '    let b = ((y));\n' +
            '    let c = (((x))) + (((y)));\n' +
            '    while (((x)) < ((y))) {\n' +
            '        a = (((x))) + 1;\n' +
            '    }\n' +
            '    if (((x)) > (((x)) + (((y))))) {\n' +
            '        return (((x)) + (((y))));\n' +
            '    } else {\n' +
            '        return ((y));\n' +
            '    }\n' +
            '}'
        );
    });
    it('testDrawif', () => {
        assert.equal(
            DrawAllG('digraph{n0 [label="entry", style="rounded"]\n' +
                'n1 [label="let a = x + 1;"]\n' +
                'n2 [label="let b = a + y;"]\n' +
                'n3 [label="let c = 0;"]\n' +
                'n4 [label="b < z"]\n' +
                'n5 [label="c = c + 5"]\n' +
                'n6 [label="return c;"]\n' +
                'n7 [label="b < z * 2"]\n' +
                'n8 [label="c = c + x + 5"]\n' +
                'n9 [label="c = c + z + 5"]\n' +
                'n10 [label="exit", style="rounded"]\n' +
                'n0 -> n1 []\n' +
                'n1 -> n2 []\n' +
                'n1 -> n10 [color="red", label="exception"]\n' +
                'n2 -> n3 []\n' +
                'n2 -> n10 [color="red", label="exception"]\n' +
                'n3 -> n4 []\n' +
                'n4 -> n5 [label="true"]\n' +
                'n4 -> n7 [label="false"]\n' +
                'n4 -> n10 [color="red", label="exception"]\n' +
                'n5 -> n6 []\n' +
                'n5 -> n10 [color="red", label="exception"]\n' +
                'n6 -> n10 []\n' +
                'n7 -> n8 [label="true"]\n' +
                'n7 -> n9 [label="false"]\n' +
                'n7 -> n10 [color="red", label="exception"]\n' +
                'n8 -> n6 []\n' +
                'n8 -> n10 [color="red", label="exception"]\n' +
                'n9 -> n6 []\n' +
                'n9 -> n10 [color="red", label="exception"]\n' +
                '}',parseCode('let x = 1, y=2,z=3;'),mainfunc(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '    }\n' +
                '    \n' +
                '    return c;\n' +
                '}\n'),parseCode('let x = 1, y=2,z=3;'))),
            'digraph{n0 [label="entry", style="rounded", color = "green"]\n' +
            'n1 [label="let a = x + 1;", color = "green"]\n' +
            'n2 [label="let b = a + y;", color = "green"]\n' +
            'n3 [label="let c = 0;", color = "green"]\n' +
            'n4 [label="b < z", shape = "diamond", color = "green"]\n' +
            'n5 [label="c = c + 5"]\n' +
            'n6 [label="return c;", color = "green"]\n' +
            'n7 [label="b < z * 2", shape = "diamond", color = "green"]\n' +
            'n8 [label="c = c + x + 5", color = "green"]\n' +
            'n9 [label="c = c + z + 5"]\n' +
            'n10 [label="exit", style="rounded", color = "green"]\n' +
            'n0 -> n1 []\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 []\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n7 [label="false"]\n' +
            'n5 -> n6 []\n' +
            'n6 -> n10 []\n' +
            'n7 -> n8 [label="true"]\n' +
            'n7 -> n9 [label="false"]\n' +
            'n8 -> n6 []\n' +
            'n9 -> n6 []\n' +
            '}\n' +
            '\n' +
            '\n' +
            ''
        );
    });

    it('testDrawWhile', () => {
        assert.equal(
            DrawAllG('digraph{n0 [label="entry", style="rounded"]\n' +
                'n1 [label="let a = x + 1;"]\n' +
                'n2 [label="let b = a + y;"]\n' +
                'n3 [label="let c = 0;"]\n' +
                'n4 [label="a < z"]\n' +
                'n5 [label="c = a + b"]\n' +
                'n6 [label="z = c * 2"]\n' +
                'n7 [label="a++"]\n' +
                'n8 [label="return z;"]\n' +
                'n9 [label="exit", style="rounded"]\n' +
                'n0 -> n1 []\n' +
                'n1 -> n2 []\n' +
                'n1 -> n9 [color="red", label="exception"]\n' +
                'n2 -> n3 []\n' +
                'n2 -> n9 [color="red", label="exception"]\n' +
                'n3 -> n4 []\n' +
                'n4 -> n5 [label="true"]\n' +
                'n4 -> n8 [label="false"]\n' +
                'n4 -> n9 [color="red", label="exception"]\n' +
                'n5 -> n6 []\n' +
                'n5 -> n9 [color="red", label="exception"]\n' +
                'n6 -> n7 []\n' +
                'n6 -> n9 [color="red", label="exception"]\n' +
                'n7 -> n4 []\n' +
                'n8 -> n9 []\n' +
                '}',parseCode('let x = 1, y=2,z=3;'),mainfunc(parseCode('function foo(x, y, z){\n' +
                '   let a = x + 1;\n' +
                '   let b = a + y;\n' +
                '   let c = 0;\n' +
                '   \n' +
                '   while (a < z) {\n' +
                '       c = a + b;\n' +
                '       z = c * 2;\n' +
                '       a++;\n' +
                '   }\n' +
                '   \n' +
                '   return z;\n' +
                '}\n'),parseCode('let x = 1, y=2,z=3;'))),
            'digraph{n0 [label="entry", style="rounded", color = "green"]\n' +
            'n1 [label="let a = x + 1;", color = "green"]\n' +
            'n2 [label="let b = a + y;", color = "green"]\n' +
            'n3 [label="let c = 0;", color = "green"]\n' +
            'n4 [label="a < z", shape = "diamond", color = "green"]\n' +
            'n5 [label="c = a + b", color = "green"]\n' +
            'n6 [label="z = c * 2", color = "green"]\n' +
            'n7 [label="a++", color = "green"]\n' +
            'n8 [label="return z;", color = "green"]\n' +
            'n9 [label="exit", style="rounded", color = "green"]\n' +
            'n0 -> n1 []\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 []\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n8 [label="false"]\n' +
            'n5 -> n6 []\n' +
            'n6 -> n7 []\n' +
            'n7 -> n4 []\n' +
            'n8 -> n9 []\n' +
            '}\n' +
            '\n' +
            '\n' +
            ''
        );
    });

});
