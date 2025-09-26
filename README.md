# 🚚 Delivery Pro - Sistema de Roteirização para Entregadores

Um aplicativo completo e profissional para gerenciamento de entregas, roteirização inteligente e automação de comunicação via WhatsApp.

## ✨ Funcionalidades Principais

### 🔐 Sistema de Autenticação
- Login e cadastro de usuários
- Perfis diferenciados (Admin/Entregador)
- Autenticação segura com Supabase

### 📦 Gerenciamento de Entregas
- Cadastro completo de entregas
- Integração com SPX Entregadores
- Rastreamento de status em tempo real
- Informações detalhadas do cliente

### 📱 Automação WhatsApp
- Mensagens automáticas quando "a caminho"
- Templates personalizáveis
- Integração direta com WhatsApp Web
- Notificações profissionais para clientes

### 🧮 Contador de Clicks Personalizado
- Contadores múltiplos por usuário
- Incrementos configuráveis (1, 5 ou 10)
- Interface intuitiva e responsiva
- Ideal para controle de produtividade

### 🗺️ Sistema de Rotas (Em Desenvolvimento)
- Otimização automática de rotas
- Cálculo de distâncias
- Estimativas de tempo
- Integração com mapas

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4 com design moderno
- **UI Components**: Shadcn/ui + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth)
- **Mapas**: Leaflet + React Leaflet
- **Ícones**: Lucide React

## 📋 Pré-requisitos

1. **Conta Supabase**: Necessária para banco de dados e autenticação
2. **Node.js**: Versão 18 ou superior
3. **NPM/Yarn**: Para gerenciamento de dependências

## ⚙️ Configuração do Projeto

### 1. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. No painel do Supabase, vá em **SQL Editor**
3. Execute o script `database-setup.sql` para criar as tabelas
4. Copie as credenciais do projeto:
   - **Project URL**: Encontre em Settings → API
   - **Anon Key**: Encontre em Settings → API

### 2. Configurar Variáveis de Ambiente

Conecte sua conta Supabase nas **Configurações do Projeto → Integrações → Supabase** ou configure manualmente:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3. Instalar e Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

## 📱 Como Usar

### 1. **Primeiro Acesso**
- Cadastre-se com email e senha
- Seu perfil será criado automaticamente como "entregador"

### 2. **Dashboard Principal**
- Visualize estatísticas das suas entregas
- Acompanhe entregas recentes
- Acesse todas as funcionalidades

### 3. **Gerenciar Entregas**
- Cadastre novas entregas com dados completos
- Atualize status: Pendente → Em Andamento → Entregue
- Envie mensagens automáticas via WhatsApp
- Acesse rastreamento SPX diretamente

### 4. **Contadores de Clicks**
- Crie contadores personalizados
- Configure incrementos (1, 5 ou 10)
- Use para controlar produtividade
- Exemplo: "Entregas do dia", "Ligações feitas", etc.

### 5. **Integração WhatsApp**
- Ao marcar entrega como "Em Andamento"
- Mensagem automática é enviada ao cliente
- Personalize templates conforme necessário

### 6. **Integração SPX**
- Cadastre códigos de rastreamento SPX
- Acesso direto ao tracking
- Acompanhamento em tempo real

## 🎨 Design e Interface

- **Design Responsivo**: Funciona perfeitamente em mobile e desktop
- **Cores Modernas**: Gradientes azul/roxo para visual profissional
- **Interface Intuitiva**: Navegação simples e eficiente
- **Feedback Visual**: Status coloridos e ícones informativos

## 🔒 Segurança

- **Row Level Security (RLS)**: Cada usuário acessa apenas seus dados
- **Autenticação JWT**: Tokens seguros do Supabase
- **Validação de Dados**: Validações client-side e server-side
- **HTTPS**: Comunicação criptografada

## 📊 Estrutura do Banco de Dados

### Tabelas Principais:
- **profiles**: Dados dos usuários
- **deliveries**: Informações das entregas
- **routes**: Rotas otimizadas (futuro)
- **click_counters**: Contadores personalizados

### Relacionamentos:
- Usuário → Entregas (1:N)
- Usuário → Rotas (1:N)
- Usuário → Contadores (1:N)

## 🚀 Próximas Funcionalidades

- [ ] **Otimização de Rotas**: Algoritmo para melhor sequência de entregas
- [ ] **Relatórios Avançados**: Gráficos e métricas detalhadas
- [ ] **Notificações Push**: Alertas em tempo real
- [ ] **Integração GPS**: Rastreamento em tempo real
- [ ] **API Externa**: Integração com outros sistemas
- [ ] **App Mobile**: Versão nativa para iOS/Android

## 💰 Potencial Comercial

Este sistema foi desenvolvido com foco em **monetização** e **profissionalismo**:

- **SaaS Model**: Cobrança por usuário/mês
- **White Label**: Personalização para empresas
- **Integrações Premium**: APIs avançadas
- **Suporte Técnico**: Planos de suporte
- **Treinamento**: Cursos e consultoria

## 🛠️ Suporte e Manutenção

- **Código Limpo**: Arquitetura escalável e maintível
- **Documentação**: Código bem documentado
- **Testes**: Estrutura preparada para testes
- **Deploy**: Pronto para produção

## 📞 Contato e Suporte

Para dúvidas, sugestões ou suporte técnico, entre em contato através dos canais oficiais.

---

**Delivery Pro** - Transformando a logística de entregas com tecnologia de ponta! 🚀