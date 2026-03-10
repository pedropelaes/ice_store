# ICE Store - E-commerce Fullstack

A **ICE Store** é uma plataforma de e-commerce desenvolvida com foco em performance, experiência do usuário (UX) e segurança. O projeto foi arquitetado separando de forma clara os domínios da aplicação: a **Jornada do Cliente** (B2C) e o **Sistema de Gestão** (Admin/Backoffice).

Construído com as ferramentas mais modernas do ecossistema React e Node.js, este projeto resolve desafios reais de engenharia de software em comércio eletrônico, como concorrência de estoque, integrações de pagamento seguras e cálculos logísticos dinâmicos.

---

## Tecnologias e Arquitetura

O projeto utiliza uma stack robusta e 100% tipada (End-to-End Type Safety), garantindo alta manutenibilidade e prevenção de erros em tempo de compilação:

* **Framework:** [Next.js (App Router)](https://nextjs.org/) - Renderização híbrida (SSR/CSR) e otimização de rotas.
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/) - Tipagem estrita desde o banco de dados até a interface.
* **Banco de Dados & ORM:** [PostgreSQL] + [Prisma ORM](https://www.prisma.io/) - Relacionamentos complexos e queries transacionais.
* **Gerenciamento de Estado:** [TanStack Query](https://tanstack.com/query) - Cache inteligente, mutações assíncronas e sincronização de dados do servidor.
* **Background Jobs & Filas:** [Upstash (QStash/Redis)](https://upstash.com/) - Agendamento de filas de mensagens (cronjobs) para cancelamento assíncrono de pedidos e liberação de estoque.
* **Armazenamento de Mídia:** [Cloudinary](https://cloudinary.com/) - Upload, otimização e entrega de imagens em nuvem (CDN).
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/) - UI responsiva, escalável e design system consistente.
* **Autenticação:** [NextAuth.js](https://next-auth.js.org/) - Gestão de sessões seguras e controle de acesso baseado em roles (RBAC).
* **Mensageria:** [Resend](https://resend.com/) - E-mails transacionais (recibos, recuperação de credenciais e verificação de contas).

---

## Integrações Externas e APIs

* **Gateway de Pagamento (Mercado Pago v2):** Implementação híbrida suportando PIX (com *polling* em tempo real para confirmação assíncrona) e Cartão de Crédito com tokenização no lado do cliente (*PCI Compliance*).
* **Motor Logístico (MelhorEnvio & ViaCEP):** Autocompletar de endereços e cálculo dinâmico de fretes baseado em regras de cubagem e peso dos produtos.

---

## Principais Funcionalidades

### Sistema de Gestão (Backoffice / Admin)
- **Painel de Controle:** Monitoramento de KPIs da loja e alertas automatizados para mitigação de ruptura de estoque.
- **Gestão Avançada de Catálogo:** - Interface de edição *in-line* em tabelas de alta performance, minimizando atrito operacional.
  - Sistema de criação em lote (*Batch Insert*) com processamento paralelo de uploads no Cloudinary.
  - Validação de integridade: regras de negócio rigorosas que exigem conformidade de dados logísticos antes da publicação de um produto.
- **Order Management System (OMS):** Rastreamento completo do ciclo de vida dos pedidos, com paginação server-side, buscas indexadas e filtros combinados.
- **CMS Básico:** Gerenciamento dinâmico de campanhas e banners da vitrine principal.

### Experiência do Consumidor (Storefront)
- **Jornada de Descoberta:** Catálogo com paginação fluida, filtros dinâmicos, ordenação por relevância e buscas textuais tolerantes a falhas.
- **Checkout Otimizado (Frictionless):** - Fluxo em 3 etapas com validação de formulários em tempo real.
  - Funcionalidade "One-Click Buy" utilizando dados de cobrança e tokens de cartões previamente salvos de forma segura.
  - **Reserva Transacional de Estoque:** Bloqueio de itens no banco de dados durante a finalização da compra para evitar *overselling* (venda de itens esgotados).
  - **Reserva e Expiração de Estoque:** Bloqueio de itens no momento da compra com cronômetro de 15 minutos. Caso o pagamento (PIX/Cartão) não seja confirmado, um *background job* via Upstash cancela o pedido e devolve os itens ao estoque automaticamente, prevenindo travamento de inventário.
- **Self-Service do Cliente:** Painel privado para acompanhamento de pedidos, gestão de dados sensíveis e sistema integrado de avaliações e reviews de produtos.
- **Segurança de Identidade:** Fluxos completos de recuperação de senha e verificação de e-mail utilizando tokens criptografados.

---

## Destaques de Engenharia de Software

1. **Design de Componentes Genéricos:** Desenvolvimento de componentes de UI altamente reutilizáveis e agnósticos (como células de tabelas mutáveis), capazes de processar strings, numéricos, arrays e objetos de forma segura com TypeScript.
2. **Type Safety Estrito e Global:** Extensão de escopos globais (ex: tipagem de SDKs injetados na `Window`) e aproveitamento de tipos inferidos do banco de dados (`Prisma Payloads`) para garantir que o Front-end reflita perfeitamente o Back-end.
3. **Otimização de Ciclo de Vida (React 18):** Controle rigoroso de efeitos colaterais e mutações de estado, utilizando `useRef` e `useCallback` para evitar renderizações em cascata (*cascading renders*) e condições de corrida (*race conditions*) em requisições de rede.
4. **Resiliência de Banco de Dados:** Uso de transações (ACID) em operações críticas, como o processamento de pagamentos e a atualização de estoque em lote, garantindo que o banco de dados nunca entre em um estado inconsistente caso ocorra uma falha no meio da operação.

--- 

## Autor

Desenvolvido por **Pedro Pelaes Malinconico** como parte do portfólio de Engenharia de Software.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/pedro-pelaes-malinconico-625287328)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/pedropelaes/)
