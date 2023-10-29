module.exports = grammar({
    name: 'monkeyc',

    word: $ => $._identifier,

    rules: {
        source_file: $ => repeat($._statement),

        _statement: $ => choice(
            $.variable_declaration
        ),

        visibility: $ => choice(
            'public',
            'private',
            'protected'
        ),

        _type_declaration: $ => seq(
            'as',
            field('type', $.identifier)
        ),

        variable_declaration: $ => seq(
            optional($.visibility),
            'var',
            $.identifier,
            optional($._type_declaration),
            '=',
            field('value', $._expression),
            $._semicolon
        ),

        _semicolon: $ => ';',

        _identifier: $ => /[a-zA-Z_]+/,
        identifier: $ => $._identifier,

        string: $ => seq(
            '"',
            repeat(choice(
                token.immediate(prec(1, /[^"\\]+/)),
                $.escape_sequence
            )),
            '"'
        ),

        number: $ => /\d+/,

        array: $ => seq(
            '[',
                commaSep(/.+/),
                ']'
        ),

        escape_sequence: $ => token(prec(1, seq(
            '\\',
            choice(
                /[^xuU]/,
                /\d{2,3}/,
                /x[0-9a-fA-F]{2,}/,
                /u[0-9a-fA-F]{4}/,
                /U[0-9a-fA-F]{8}/
            )
        ))),

        builtin_type: $ => choice(
            'Any',
            'Void',
            'Number',
            'Float',
            'Long',
            'Double',
            'String',
            'Toybox'
        ),

        annotation: $ => seq(
            '(',
            field('annotation_name',
            choice(
                ':background',
                ':debug',
                ':glance',
                ':release',
                ':test',
                ':typecheck',
                /:[^)]*/,
            )),
            ')'
        ),

        _literal: $ => choice(
             'true',
            'false',
            'null',
            $.number,
            $.string
        ),
    
        _expression: $ => choice(
            $._literal
        ),
        
        if_statement: $ => ''
    }
});

function commaSep1(rule) {
    return seq(rule, repeat(seq(',', rule)));
}

function commaSep(rule) {
    return optional(commaSep1(rule));
}
