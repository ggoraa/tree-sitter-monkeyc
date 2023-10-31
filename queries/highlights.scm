(null_literal) @variable.builtin
(string_literal) @string
(number_literal) @number
(visibility_modifier) @keyword
[ ";" ] @punctuation.delimiter

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
 ] @keyword

[
 "if"
 "else"
 ] @keyword
