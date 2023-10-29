module.exports = grammar({
    name: 'monkeyc',

    word: $ => $._identifier,

    rules: {
        source_file: $ => repeat($._statement),

        _statement: $ => choice(
            $.variable_declaration,
            $.comment
        ),

        visibility: $ => choice(
            'public',
            'private',
            'protected'
        ),

        type: $ => seq(
            'as',
            field('type', $._identifier)
        ),

        _literal: $ => choice(
            $.bool_literal,
            $.null_literal,
            $.number_literal,
            $.string_literal,
            $.array_literal
        ),

        _expression: $ => choice(
            $._literal
        ),

        _semicolon: $ => ';',

        _identifier: $ => /[a-zA-Z_]+/,
        identifier: $ => $._identifier,

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

        string_literal: $ => seq(
            '"',
            repeat(choice(
                token.immediate(prec(1, /[^"\\]+/)),
                $.escape_sequence
            )),
            '"'
        ),

        number_literal: $ => /\d+/,

        bool_literal: $ => choice('true', 'false'),

        // shamelessly stolen from tree-sitter-swift
        array_literal: ($) => seq(
            "[",
                optional(sep1(field("element", $._expression), ",")),
                optional(","),
                "]"
        ),

        null_literal: $ => token('null'),

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

        variable_declaration: $ => seq(
            optional($.visibility),
            'var',
            $.identifier,
            optional($.type),
            '=',
            field('value', $._expression),
            $._semicolon
        ),

        comment: $ => token(choice(
            seq('//', /(\\+(.|\r?\n)|[^\\\n])*/),
            seq(
                '/*',
                /[^*]*\*+([^/*][^*]*\*+)*/,
                '/',
            ),
        )),

        if_statement: $ => seq(
            'if',
            '(',
                // TODO: finish
                ')',
        )
    }
});

function sep1(rule, separator) {
    return seq(rule, repeat(seq(separator, rule)));
}
