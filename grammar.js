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
            $.comment,
            $.if_statement,
            $.function_declaration,
            $.using_statement,
            $._expression
        ),

        // Useful shi
        
        _identifier: $ => /[a-zA-Z_]+/,
        simple_identifier: $ => $._identifier,
        identifier: $ => seq(
            optional($.navigation_expression),
            $._identifier
        ),
        typed_identifier: $ => seq($.simple_identifier, "as", field("type", $.identifier)),
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
        ),
        code_block: $ => seq(
            "{",
            repeat($._statement),
            "}"
        ),

        // Operators
        
        _additive_operator: $ => choice("+", "-"),
        _multiplicative_operator: $ => choice("*", "/"),
        _bitwise_not_operator: $ => "~",
        _bit_shift_operator: $ => choice("<<", ">>"),
        _bitwise_and_operator: $ => "&",
        _bitwise_or_operator: $ => "|",
        _bitwise_xor_operator: $ => "^",
        _comparison_operator: $ => choice(
            "<",
            "<=",
            ">",
            ">=",
            "==",
            "!=",
        ), 

        // Modifiers

        visibility_modifier: $ => choice(
            'public',
            'private',
            'protected'
        ),

        // Expressions

        _expression: $ => choice(
            $._literal,
            $.identifier,
            $.unary_expression,
            $.binary_expression,
            $.array_index_expression,
            $.call_expression,
        ),
        unary_expression: $ => choice(
            // FIXME: implement this bitch
        ),      
        binary_expression: $ => choice(
            $._additive_expression,
            $._multiplicative_expression,
            $._modulo_expression,
            $._bitwise_not_expression,
            $._bit_shift_expression,
            $._bitwise_and_expression,
            $._bitwise_or_expression,
            $._bitwise_xor_expression,
            $._comparison_expression,
            $._as_expression
        ),
        _additive_expression: $ => binary_expr($, PRECEDENCES.addition, $._additive_operator),
        _multiplicative_expression: $ => binary_expr($, PRECEDENCES.multiplication, $._multiplicative_operator),
        _modulo_expression: $ => binary_expr($, PRECEDENCES.modulo, "%"),
        _bitwise_not_expression: $ => binary_expr($, PRECEDENCES.bitwise_not, $._bitwise_not_operator),
        _bit_shift_expression: $ => binary_expr($, PRECEDENCES.bit_shift, $._bit_shift_operator),
        _bitwise_and_expression: $ => binary_expr($, PRECEDENCES.bitwise_and, $._bitwise_and_operator),
        _bitwise_or_expression: $ => binary_expr($, PRECEDENCES.bitwise_or, $._bitwise_or_operator),
        _bitwise_xor_expression: $ => binary_expr($, PRECEDENCES.bitwise_xor, $._bitwise_xor_operator),
        _comparison_expression: $ => binary_expr($, PRECEDENCES.comparisons, $._comparison_operator),
        _as_expression: $ => binary_expr($, PRECEDENCES.function_invocation, "as"),

        // Literals

        _literal: $ => choice(
            $.bool_literal,
            $.null_literal,
            $.number_literal,
            $.string_literal,
            $.array_literal
        ),
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

        // Suffixes

        call_suffix: $ => seq(
            "(",
            optional(field("argument_list", sep1($._expression, ","))),
            ")",
            ";"
        ),
        array_index_suffix: $ => seq("[", $._expression, "]"),

        // Statements

        variable_declaration: $ => seq(
            optional($.visibility_modifier),
            choice('var', "const"),
            choice(
                $.simple_identifier,
                $.typed_identifier
            ),
            '=',
            field('value', $._expression),
            ";"
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
            "(",
            field("if_condition", $._expression),
            ")",
            field("if_branch", $.code_block),
            optional(repeat(seq(
                "else",
                "if",
                "(",
                field("else_if_condition", $.binary_expression),
                ")",
                field("else_if_branch", $.code_block),
            ))),
            optional(seq("else", field("else_branch", $.code_block)))
        ),
        navigation_expression: $ => prec(-1, seq(
            field("path", sep1($.identifier, ".")),
            ".",
            field("target", $.identifier)
        )),
        call_expression: $ => seq(
            $.navigation_expression,
            $.call_suffix
        ),
        array_index_expression: $ => seq(
            $.navigation_expression,
            $.array_index_suffix
        ),
        function_declaration: $ => seq(
            optional($.visibility_modifier),
            "function",
            field("name", $.simple_identifier),
            "(",
            optional(field("argument", sep1(choice($.simple_identifier, $.typed_identifier), ","))),
            ")",
            optional(field("type", seq("as", $.identifier))),
            field("body", $.code_block),
        ),
        using_statement: $ => seq(
            field("method", choice(
                "import",
                "using"
            )),
            $.navigation_expression,
            ";"
        ),

    }
});

function sep1(rule, separator) {
    return seq(rule, repeat(seq(separator, rule)));
}

function binary_expr($, precedence, operator) {
    const sequence = seq(
        field('lhs', $._expression),
        field('op', operator),
        field('rhs', $._expression)
    )
    if (precedence == null) {
        return sequence
    } else {
        return prec.left(precedence, sequence)
    }
}
