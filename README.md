# IsendIT.com.br

Sistema de criação de chamados para a segurança da informação, que gera automaticamente scripts para os administradores de firewalls.

Tela de Login
![image](https://github.com/user-attachments/assets/c7b85d87-5d18-4051-b634-7286a3d491cc)

## Entendendo o sistema

No `iSendit`, há dois roles possíveis, `solicitante` e `administrador`.

O `solicitante` pode criar chamados preenchendo um formulário com as informações necessárias. Atualmente podem ser criados chamados de `Regras de Firewall`, `Objetos IP/Subnet`, `Objetos Address Group` e `Objetos FQDN`.

Tela de criação de chamado de Regra de Firewall
![image](https://github.com/user-attachments/assets/9161b4e4-ea08-451c-ba73-3568ae8c259e)

Ao criar o chamado, o `administrador` é notificado de duas maneiras: a primeira é um e-mail enviado ao endereço eletrônico cadastrado, e a segunda é uma tarefa criada no sistema.

Tela de tarefas do administrador:
![image](https://github.com/user-attachments/assets/545324dd-cd3f-4c8c-8ba8-442e15d45c23)

Juntamente com a tarefa, vêm o script pronto para colar no terminal do firewall.

Modal com o script pronto para o administrador:
![image](https://github.com/user-attachments/assets/22ea4c71-d7ec-47a1-aefa-68fd714913ed)

## Estrutura

### Frontend
Linguagens/Frameworks: `React` e `Javascript`
Estilização: `CSS`

### Backend
Linguagens/Frameworks: `Node` e `Javascript`
Banco: `Supabase`
Deploy: `Vercel`

## Direito de Uso

Este sistema foi idealizado, desenvolvido e é distribuido por:

`Gabriel Gatti` e `Victor Sales`.
