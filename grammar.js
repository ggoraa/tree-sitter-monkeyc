const PRECEDENCES = {
    new: 1,
    logical_not: 1,
    bitwise_not: 1,
    function_invocation: 1,
    multiplication: 2,
    modulo: 2,
    bitwise_and: 2,
    bit_shift: 2,
    addition: 3,
    bitwise_or: 3,
    bitwise_xor: 3,
    comparisons: 4,
    logical_and: 5,
    logical_or: 6,
    conditional: 7
}

module.exports = grammar({
    name: 'monkeyc',

    word: $ => $._identifier,

    rules: {
        // backbone of the entire operation
        source_file: $ => repeat($._statement),

        _statement: $ => choice(
            $.variable_declaration,
            $.comment
        ),

        // Operators
        
        _additive_operator: $ => prec(PRECEDENCES.addition, choice(
            "+",
            "-"
        )),

        _multiplicative_operator: $ => prec(PRECEDENCES.multiplication, choice(
            "*",
            "/"
        )),

        _modulo_operator: $ => prec(PRECEDENCES.modulo, "%"),

        _bitwise_operator: $ => choice(
            prec(PRECEDENCES.bitwise_not, "~"),
            prec(PRECEDENCES.bit_shift, "<<"),
            prec(PRECEDENCES.bit_shift, ">>"),
            prec(PRECEDENCES.bitwise_and, "&"),
            prec(PRECEDENCES.bitwise_or, "|"),
            prec(PRECEDENCES.bitwise_xor, "^"),
        ),

        _comparison_operator: $ => prec(PRECEDENCES.comparisons, choice(
            "<",
            "<=",
            ">",
            ">=",
            "==",
            "!=",
        )), 

        // Modifiers

        visibility_modifier: $ => choice(
            'public',
            'private',
            'protected'
        ),

        type: $ => seq(
            'as',
            field('type', $._identifier)
        ),

        // Expressions

        _expression: $ => choice(
            $._literal
        ),

        unary_expression: $ => choice(
        ), // FIXME: implement this bitch

        binary_expression: $ => choice(
            $._additive_expression,
            $._multiplicative_expression
            // FIXME: this shi too
        ),

        _additive_expression: $ => binary_expr($, $._additive_operator),

        _multiplicative_expression: $ => binary_expr($, $._multiplicative_operator),

        _semicolon: $ => ';',

        _identifier: $ => /[a-zA-Z_]+/,
        identifier: $ => $._identifier,
        
        _literal: $ => choice(
            $.bool_literal,
            $.null_literal,
            $.number_literal,
            $.string_literal,
            $.array_literal
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
            optional($.visibility_modifier),
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

function binary_expr($, operator) {
    return seq(
        field('lhs', $._expression),
        field('op', operator),
        field('rhs', $._expression)
    )
}
