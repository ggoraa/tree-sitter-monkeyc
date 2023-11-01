(null_literal) @variable.builtin
(string_literal) @string
(number_literal) @number
(bool_literal) @boolean
(comment) @comment

[ ";" "," ] @punctuation.delimiter
[ "(" ")" "[" "]" "{" "}"] @punctuation.bracket

[
 "+"
 "-"
 "*"
 "/"
 "%"
 "<<"
 ">>"
 "<"
 "<="
 ">"
 ">="
 "=="
 "!="
 "="
] @operator

[
 "var"
 "const"
 "if"
 "else"
 "as"
 "using"
 "import"
 (visibility_modifier)
] @keyword

"function" @keyword.function

(navigation_expression path: (identifier) @type)
(call_expression (navigation_expression target: (identifier) @function.call))
