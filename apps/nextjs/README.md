# Taiyō

## Permissões

Implementei o ACL (Access Control List) para controlar as permissões de acesso aos recursos da aplicação.

Há 2 tipos de permissiões:

1. Recursos com possessão
2. Recursos sem possessão

### Com possessão

São recursos que "pertencem" a um usuário ou entidade. Exemplo: um comentátio, um capítulo (uploader + scan), etc.

Na hora de verificar as permissões, é necessário confirmar se o usuário pode ou não mexer no recurso com a ação desejada.

### Sem possessão

São recursos que não "pertencem" a ninguém. Exemplo: uma obra, uma tag, etc.

Basta um usuário ter a permissão para executar a ação desejada, não é necessário verificar se ele tem acesso ao recurso ou não.

### Lingo

- recurso: objeto no banco de dados (ex: obra, capítulo, comentário, etc)
- ação: ação que o usuário deseja executar (ex: ler, criar, editar, deletar). A ação `ler` é sempre permitida.
- possessão: se o recurso é ou não "possuído" por um usuário (ex: comentário, capítulo, etc)
