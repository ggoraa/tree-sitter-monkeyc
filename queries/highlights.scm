(null_literal) @variable.builtin
(string_literal) @string
(number_literal) @number
(bool_literal) @boolean

[ ";" ] @punctuation.delimiter
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
 (visibility_modifier)
] @keyword

