/* =========================================================
   GANHAR DINHEIRO — V3.7
   Supabase Auth + Banco de dados
========================================================= */


/* =========================================================
   CONFIGURAÇÃO SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://vbagfmzbkaybuyvmwdwh.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Og8xVgUryFYhpS0rdUCUAA_ESwIT4Lz";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   VARIÁVEIS
========================================================= */

let contaAtual = null;
let utilizadorAuth = null;


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            const {
                data: {
                    session
                }
            } =
                await supabaseClient.auth.getSession();


            if (
                session &&
                session.user
            ) {

                utilizadorAuth =
                    session.user;

                await carregarConta();

            } else {

                mostrarAutenticacao();

            }

        } catch (erro) {

            console.error(
                "Erro ao iniciar:",
                erro
            );

            mostrarAutenticacao();

        }


        /* Detectar login/logout */

        supabaseClient.auth.onAuthStateChange(
            async function (
                event,
                session
            ) {

                if (
                    session &&
                    session.user
                ) {

                    utilizadorAuth =
                        session.user;

                    if (!contaAtual) {

                        await carregarConta();

                    }

                } else {

                    utilizadorAuth = null;
                    contaAtual = null;

                    mostrarAutenticacao();

                }

            }
        );

    }
);


/* =========================================================
   AUTENTICAÇÃO — TELAS
========================================================= */

function mostrarAutenticacao() {

    esconderTodasTelas();

    const tela =
        document.getElementById(
            "authScreen"
        );

    if (tela) {

        tela.classList.remove(
            "hidden"
        );

    }

    mostrarLogin();

}


function mostrarLogin() {

    const login =
        document.getElementById(
            "loginBox"
        );

    const cadastro =
        document.getElementById(
            "registerBox"
        );


    if (login) {

        login.classList.remove(
            "hidden"
        );

    }


    if (cadastro) {

        cadastro.classList.add(
            "hidden"
        );

    }

}


function mostrarCadastro() {

    const login =
        document.getElementById(
            "loginBox"
        );

    const cadastro =
        document.getElementById(
            "registerBox"
        );


    if (login) {

        login.classList.add(
            "hidden"
        );

    }


    if (cadastro) {

        cadastro.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   CRIAR CONTA
========================================================= */

async function criarConta() {

      const parametrosConvite =
        new URLSearchParams(window.location.search);

    const codigoConvite =
        parametrosConvite.get("convite");

    if (codigoConvite) {
        localStorage.setItem(
            "codigoConvitePendente",
            codigoConvite
        );
    }

    const usernameElement =
        document.getElementById(
            "registerUsername"
        );

    const emailElement =
        document.getElementById(
            "registerEmail"
        );

    const passwordElement =
        document.getElementById(
            "registerPassword"
        );

    const mensagem =
        document.getElementById(
            "registerMessage"
        );


    const username =
        usernameElement?.value
            ?.trim() || "";

    const email =
        emailElement?.value
            ?.trim() || "";

    const password =
        passwordElement?.value || "";


    if (mensagem) {
        mensagem.textContent = "";
    }


    if (
        !username ||
        !email ||
        !password
    ) {

        if (mensagem) {

            mensagem.textContent =
                "Preencha todos os campos.";

        }

        return;

    }


    if (password.length < 6) {

        if (mensagem) {

            mensagem.textContent =
                "A senha deve ter pelo menos 6 caracteres.";

        }

        return;

    }


    if (mensagem) {

        mensagem.textContent =
            "⏳ Criando sua conta...";

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({

                email:
                    email,

                password:
                    password,

                options: {

                    data: {

                        username:
                            username

                    }

                }

            });


        if (error) {

            console.error(
                "ERRO AO CRIAR CONTA:",
                error
            );

            if (mensagem) {

                mensagem.textContent =
                    "❌ " +
                    error.message;

            }

            return;

        }


        if (!data.user) {

            if (mensagem) {

                mensagem.textContent =
                    "❌ Não foi possível criar a conta.";

            }

            return;

        }


        utilizadorAuth =
            data.user;


        if (data.session) {

    await carregarConta();

    await processarConvite();

        } else {

            if (mensagem) {

                mensagem.textContent =
                    "✅ Conta criada! Verifique o seu email para confirmar a conta.";

            }

        }


    } catch (erro) {

        console.error(
            "ERRO AO CRIAR CONTA:",
            erro
        );

        if (mensagem) {

            mensagem.textContent =
                "❌ Ocorreu um erro ao criar a conta.";

        }

    }

}


/* =========================================================
   LOGIN
========================================================= */

async function entrar() {

    const emailElement =
        document.getElementById(
            "loginEmail"
        );

    const passwordElement =
        document.getElementById(
            "loginPassword"
        );

    const mensagem =
        document.getElementById(
            "loginMessage"
        );


    const email =
        emailElement?.value
            ?.trim() || "";

    const password =
        passwordElement?.value || "";


    if (mensagem) {

        mensagem.textContent = "";

    }


    if (
        !email ||
        !password
    ) {

        if (mensagem) {

            mensagem.textContent =
                "Preencha o email e a senha.";

        }

        return;

    }


    if (mensagem) {

        mensagem.textContent =
            "⏳ Entrando...";

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email:
                        email,

                    password:
                        password

                });


        if (error) {

            console.error(
                "ERRO LOGIN:",
                error
            );

            if (mensagem) {

                mensagem.textContent =
                    "❌ Email ou senha incorretos.";

            }

            return;

        }


        utilizadorAuth =
    data.user;


await carregarConta();

await processarConvite();


    } catch (erro) {

        console.error(
            "ERRO AO ENTRAR:",
            erro
        );

        if (mensagem) {

            mensagem.textContent =
                "❌ Erro ao entrar.";

        }

    }

}


/* =========================================================
   CARREGAR PERFIL DO BANCO
========================================================= */

async function carregarConta() {

    if (!utilizadorAuth) {

        mostrarAutenticacao();

        return;

    }


    try {

        let username =
            utilizadorAuth
                .user_metadata
                ?.username;


        if (!username) {

            username =
                utilizadorAuth
                    .email
                    ?.split("@")[0];

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("Utilizadores")
                .select("*")
                .eq(
                    "username",
                    username
                )
                .limit(1);


        if (error) {

            console.error(
                "ERRO AO PROCURAR UTILIZADOR:",
                error
            );

            alert(
                "Erro ao carregar a conta: " +
                error.message
            );

            return;

        }


        if (
            data &&
            data.length > 0
        ) {

            contaAtual =
                data[0];

        } else {

            const {
                data: novoPerfil,
                error: erroCriacao
            } =
                await supabaseClient
                    .from("Utilizadores")
                    .insert({

                        username:
                            username,

                        password:
                            "",

                        pontos:
                            0,

                        saldo:
                            0

                    })
                    .select()
                    .single();


            if (erroCriacao) {

                console.error(
                    "ERRO AO CRIAR PERFIL:",
                    erroCriacao
                );

                alert(
                    "Não foi possível criar o perfil: " +
                    erroCriacao.message
                );

                return;

            }


            contaAtual =
                novoPerfil;

        }


                abrirAplicacao();

        // Gerar/carregar código de convite
        await gerarCodigoConvite();

      await processarConvite();


    } catch (erro) {

        console.error(
            "ERRO AO CARREGAR CONTA:",
            erro
        );

        alert(
            "Erro ao carregar a conta."
        );

    }

}


/* =========================================================
   SAIR
========================================================= */

async function sair() {

    try {

        await supabaseClient
            .auth
            .signOut();

    } catch (erro) {

        console.error(
            "Erro ao sair:",
            erro
        );

    }


    contaAtual = null;
    utilizadorAuth = null;


    mostrarAutenticacao();

}


/* =========================================================
   ABRIR APLICAÇÃO
========================================================= */

function abrirAplicacao() {

    esconderTodasTelas();


    const app =
        document.getElementById(
            "appScreen"
        );


    if (app) {

        app.classList.remove(
            "hidden"
        );

    }


    const nome =
        contaAtual?.username ||
        utilizadorAuth?.email ||
        "Utilizador";


    const welcome =
        document.getElementById(
            "welcomeUser"
        );


    if (welcome) {

        welcome.textContent =
            "Olá, " +
            nome +
            "!";

    }


    atualizarInterface();

    mostrarSecao("inicio");

}


/* =========================================================
   INTERFACE
========================================================= */

function atualizarInterface() {

    if (!contaAtual) {

        return;

    }


    const pontos =
        Number(
            contaAtual.pontos || 0
        );


    const saldo =
        Number(
            contaAtual.saldo || 0
        );


    const saldoElement =
        document.getElementById(
            "saldo"
        );


    if (saldoElement) {

        saldoElement.textContent =
            saldo.toFixed(2) +
            " MT";

    }


    const pontosElement =
        document.getElementById(
            "pontos"
        );


    if (pontosElement) {

        pontosElement.textContent =
            pontos +
            " pontos";

    }


    const usernameElement =
        document.getElementById(
            "profileUsername"
        );


    if (usernameElement) {

        usernameElement.textContent =
            contaAtual.username ||
            "-";

    }


    const emailElement =
        document.getElementById(
            "profileEmail"
        );


    if (emailElement) {

        emailElement.textContent =
            utilizadorAuth?.email ||
            "-";

    }


    const profilePoints =
        document.getElementById(
            "profilePoints"
        );


    if (profilePoints) {

        profilePoints.textContent =
            pontos +
            " pontos";

    }


    const profileBalance =
        document.getElementById(
            "profileBalance"
        );


    if (profileBalance) {

        profileBalance.textContent =
            saldo.toFixed(2) +
            " MT";

    }


    atualizarHistorico();

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function mostrarSecao(id) {

    const secoes =
        document.querySelectorAll(
            ".section"
        );


    secoes.forEach(
        function (secao) {

            secao.classList.add(
                "hidden"
            );

        }
    );


    const secao =
        document.getElementById(
            id
        );


    if (secao) {

        secao.classList.remove(
            "hidden"
        );

    }


    atualizarInterface();

}


/* =========================================================
   ASSISTIR VÍDEO
========================================================= */

async function assistirVideo() {

    if (!contaAtual) {

        return;

    }


    const botao =
        document.getElementById(
            "btnAssistir"
        );

    const mensagem =
        document.getElementById(
            "videoMessage"
        );


    if (botao) {

        botao.disabled = true;

    }


    if (mensagem) {

        mensagem.textContent =
            "⏳ Assistindo vídeo...";

    }


    setTimeout(
        async function () {

            const novosPontos =
                Number(
                    contaAtual.pontos || 0
                ) + 10;


            const sucesso =
                await atualizarDadosUtilizador({

                    pontos:
                        novosPontos

                });


            if (!sucesso) {

                if (mensagem) {

                    mensagem.textContent =
                        "❌ Não foi possível guardar os pontos.";

                }

                if (botao) {

                    botao.disabled = false;

                }

                return;

            }


            contaAtual.pontos =
                novosPontos;


            if (mensagem) {

                mensagem.textContent =
                    "✅ Você ganhou 10 pontos!";

            }


            if (botao) {

                botao.disabled = false;

            }


            atualizarInterface();

        },
        3000
    );

}


/* =========================================================
   RECOMPENSAS
========================================================= */

async function converterPontos(
    pontos,
    valor
) {

    if (!contaAtual) {

        return;

    }


    const mensagem =
        document.getElementById(
            "rewardMessage"
        );


    const pontosAtuais =
        Number(
            contaAtual.pontos || 0
        );


    const saldoAtual =
        Number(
            contaAtual.saldo || 0
        );


    if (
        pontosAtuais < pontos
    ) {

        if (mensagem) {

            mensagem.textContent =
                "❌ Você não possui pontos suficientes.";

        }

        return;

    }


    const novosPontos =
        pontosAtuais -
        pontos;


    const novoSaldo =
        saldoAtual +
        Number(valor);


    const sucesso =
        await atualizarDadosUtilizador({

            pontos:
                novosPontos,

            saldo:
                novoSaldo

        });


    if (!sucesso) {

        if (mensagem) {

            mensagem.textContent =
                "❌ Erro ao guardar a conversão.";

        }

        return;

    }


    contaAtual.pontos =
        novosPontos;


    contaAtual.saldo =
        novoSaldo;


    if (mensagem) {

        mensagem.textContent =
            "✅ Conversão realizada com sucesso!";

    }


    atualizarInterface();

}


/* =========================================================
   ATUALIZAR UTILIZADOR NO SUPABASE
========================================================= */

async function atualizarDadosUtilizador(
    dados
) {

    if (!contaAtual?.id) {

        console.error(
            "ID do utilizador não encontrado."
        );

        return false;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("Utilizadores")
            .update(dados)
            .eq(
                "id",
                contaAtual.id
            )
            .select()
            .single();


    if (error) {

        console.error(
            "ERRO AO ATUALIZAR UTILIZADOR:",
            error
        );

        return false;

    }


    contaAtual =
        data;


    return true;

}


/* =========================================================
   SOLICITAR SAQUE
========================================================= */

async function solicitarSaque() {

    if (!contaAtual?.id) {

        return;

    }


    const metodoElement =
        document.getElementById(
            "metodoSaque"
        );

    const numeroElement =
        document.getElementById(
            "numeroSaque"
        );

    const valorElement =
        document.getElementById(
            "valorSaque"
        );

    const mensagem =
        document.getElementById(
            "saqueMessage"
        );


    const metodo =
        metodoElement?.value || "";

    const numero =
        numeroElement?.value
            ?.trim() || "";

    const valor =
        Number(
            valorElement?.value || 0
        );


    if (mensagem) {

        mensagem.textContent = "";

    }


    if (
        !numero ||
        !valor
    ) {

        if (mensagem) {

            mensagem.textContent =
                "Preencha todos os campos.";

        }

        return;

    }


    if (valor < 100) {

        if (mensagem) {

            mensagem.textContent =
                "O saque mínimo é de 100 MT.";

        }

        return;

    }


    const saldoAtual =
        Number(
            contaAtual.saldo || 0
        );


    if (valor > saldoAtual) {

        if (mensagem) {

            mensagem.textContent =
                "Saldo insuficiente.";

        }

        return;

    }


    if (mensagem) {

        mensagem.textContent =
            "⏳ Enviando pedido...";

    }


    /* Reservar saldo */

    const novoSaldo =
        saldoAtual -
        valor;


    const saldoAtualizado =
        await atualizarDadosUtilizador({

            saldo:
                novoSaldo

        });


    if (!saldoAtualizado) {

        if (mensagem) {

            mensagem.textContent =
                "❌ Não foi possível reservar o saldo.";

        }

        return;

    }


    /* Criar pedido */

    const {
        data: saque,
        error
    } =
        await supabaseClient
            .from("Saques")
            .insert({

                utilizador_id:
                    contaAtual.id,

                metodo:
                    metodo,

                numero:
                    numero,

                valor:
                    valor,

                estado:
                    "Pendente"

            })
            .select()
            .single();


    if (error) {

        console.error(
            "ERRO AO CRIAR SAQUE:",
            error
        );


        /* Devolver saldo se falhar */

        await atualizarDadosUtilizador({

            saldo:
                saldoAtual

        });


        if (mensagem) {

            mensagem.textContent =
                "❌ Não foi possível criar o pedido de saque.";

        }

        return;

    }


    contaAtual.saldo =
        novoSaldo;


    if (mensagem) {

        mensagem.textContent =
            "✅ Pedido de saque enviado! ID: SAQ-" +
            saque.id;

    }


    if (numeroElement) {

        numeroElement.value = "";

    }


    if (valorElement) {

        valorElement.value = "";

    }


    atualizarInterface();

}


/* =========================================================
   HISTÓRICO DE SAQUES
========================================================= */

async function atualizarHistorico() {

    const container =
        document.getElementById(
            "historicoSaques"
        );


    if (
        !container ||
        !contaAtual?.id
    ) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("Saques")
            .select("*")
            .eq(
                "utilizador_id",
                contaAtual.id
            )
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    if (error) {

        console.error(
            "ERRO NO HISTÓRICO:",
            error
        );


        container.innerHTML =
            '<p class="empty">Não foi possível carregar o histórico.</p>';

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML =
            '<p class="empty">Nenhum saque realizado.</p>';

        return;

    }


    container.innerHTML =
        data.map(
            function (saque) {

                const id =
                    "SAQ-" +
                    saque.id;


                const dataFormatada =
                    saque.created_at
                        ? new Date(
                            saque.created_at
                        ).toLocaleString(
                            "pt-PT"
                        )
                        : "-";


                return `

                    <div class="saque-item">

                        <p>
                            <strong>ID:</strong>
                            ${id}
                        </p>

                        <p>
                            <strong>Método:</strong>
                            ${escaparHTML(
                                saque.metodo
                            )}
                        </p>

                        <p>
                            <strong>Número:</strong>
                            ${escaparHTML(
                                saque.numero
                            )}
                        </p>

                        <p>
                            <strong>Valor:</strong>
                            ${Number(
                                saque.valor || 0
                            ).toFixed(2)} MT
                        </p>

                        <p>
                            <strong>Data:</strong>
                            ${dataFormatada}
                        </p>

                        <p>
                            <strong>Estado:</strong>

                            <span class="${classeEstado(
                                saque.estado
                            )}">

                                ${escaparHTML(
                                    saque.estado
                                )}

                            </span>

                        </p>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   ÁREA ADMIN
========================================================= */

function mostrarAdmin() {

    esconderTodasTelas();


    const adminScreen =
        document.getElementById(
            "adminScreen"
        );


    if (adminScreen) {

        adminScreen.classList.remove(
            "hidden"
        );

    }


    const adminContent =
        document.getElementById(
            "adminContent"
        );


    if (adminContent) {

        adminContent.classList.add(
            "hidden"
        );

    }


    const adminLogin =
        document.getElementById(
            "adminLogin"
        );


    if (adminLogin) {

        adminLogin.classList.remove(
            "hidden"
        );

    }


    const adminUser =
        document.getElementById(
            "adminUser"
        );


    if (adminUser) {

        adminUser.value = "";

    }


    const adminPassword =
        document.getElementById(
            "adminPassword"
        );


    if (adminPassword) {

        adminPassword.value = "";

    }


    const adminMessage =
        document.getElementById(
            "adminMessage"
        );


    if (adminMessage) {

        adminMessage.textContent = "";

    }

}


/* =========================================================
   LOGIN ADMIN
========================================================= */

async function entrarAdmin() {

    const emailElement =
        document.getElementById(
            "adminUser"
        );

    const passwordElement =
        document.getElementById(
            "adminPassword"
        );

    const mensagem =
        document.getElementById(
            "adminMessage"
        );


    const email =
        emailElement?.value
            ?.trim() || "";

    const senha =
        passwordElement?.value || "";


    if (mensagem) {

        mensagem.textContent = "";

    }


    if (
        !email ||
        !senha
    ) {

        if (mensagem) {

            mensagem.textContent =
                "❌ Preencha o email e a senha.";

        }

        return;

    }


    if (mensagem) {

        mensagem.textContent =
            "⏳ Entrando...";

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email:
                        email,

                    password:
                        senha

                });


        if (error) {

            console.error(
                "ERRO LOGIN ADMIN:",
                error
            );

            if (mensagem) {

                mensagem.textContent =
                    "❌ Email ou senha incorretos.";

            }

            return;

        }


        utilizadorAuth =
            data.user;


        const username =
            email
                .split("@")[0]
                .trim();


        const {
            data: utilizador,
            error: erroPerfil
        } =
            await supabaseClient
                .from("Utilizadores")
                .select("is_admin")
                .eq(
                    "username",
                    username
                )
                .maybeSingle();


        if (erroPerfil) {

            console.error(
                "ERRO AO VERIFICAR ADMIN:",
                erroPerfil
            );

            await supabaseClient
                .auth
                .signOut();

            if (mensagem) {

                mensagem.textContent =
                    "❌ Erro ao verificar administrador.";

            }

            return;

        }


        if (
            !utilizador ||
            utilizador.is_admin !== true
        ) {

            await supabaseClient
                .auth
                .signOut();

            utilizadorAuth = null;

            if (mensagem) {

                mensagem.textContent =
                    "❌ Esta conta não é administradora.";

            }

            return;

        }


        if (mensagem) {

            mensagem.textContent =
                "✅ Login de administrador realizado!";

        }


        await abrirPainelAdmin();


    } catch (erro) {

        console.error(
            "ERRO ADMIN:",
            erro
        );

        if (mensagem) {

            mensagem.textContent =
                "❌ Erro ao entrar no painel.";

        }

    }

}


/* =========================================================
   ABRIR PAINEL ADMIN
========================================================= */

async function abrirPainelAdmin() {

    const adminLogin =
        document.getElementById(
            "adminLogin"
        );


    const adminContent =
        document.getElementById(
            "adminContent"
        );


    const adminScreen =
        document.getElementById(
            "adminScreen"
        );


    if (adminScreen) {

        adminScreen.classList.remove(
            "hidden"
        );

    }


    if (adminLogin) {

        adminLogin.classList.add(
            "hidden"
        );

    }


    if (adminContent) {

        adminContent.classList.remove(
            "hidden"
        );

    }


    await atualizarPainelAdmin();

}


/* =========================================================
   SAIR ADMIN
========================================================= */

async function sairAdmin() {

    try {

        await supabaseClient
            .auth
            .signOut();

    } catch (erro) {

        console.error(
            "ERRO AO SAIR ADMIN:",
            erro
        );

    }


    utilizadorAuth = null;
    contaAtual = null;


    mostrarAutenticacao();

}


/* =========================================================
   PAINEL ADMIN
========================================================= */

async function atualizarPainelAdmin() {

    const total =
        document.getElementById(
            "adminTotalSaques"
        );

    const totalUtilizadores =
        document.getElementById(
            "adminTotalUtilizadores"
        );

    const pendentes =
        document.getElementById(
            "adminPendentes"
        );

    const pagos =
        document.getElementById(
            "adminPagos"
        );

    const rejeitados =
        document.getElementById(
            "adminRejeitados"
        );

    const valorPendente =
        document.getElementById(
            "adminValorPendente"
        );

    const valorPago =
        document.getElementById(
            "adminValorPago"
        );

    const valorRejeitado =
        document.getElementById(
            "adminValorRejeitado"
        );

    const container =
        document.getElementById(
            "adminSaques"
        );


    /* =====================================================
       CARREGAR SAQUES
    ===================================================== */

    const {
        data: saques,
        error
    } =
        await supabaseClient
            .from("Saques")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    if (error) {

        console.error(
            "ERRO AO CARREGAR SAQUES:",
            error
        );


        if (total) {
            total.textContent = "0";
        }

        if (totalUtilizadores) {
            totalUtilizadores.textContent = "0";
        }

        if (pendentes) {
            pendentes.textContent = "0";
        }

        if (pagos) {
            pagos.textContent = "0";
        }

        if (rejeitados) {
            rejeitados.textContent = "0";
        }

        if (valorPendente) {
            valorPendente.textContent = "0.00 MT";
        }

        if (valorPago) {
            valorPago.textContent = "0.00 MT";
        }

        if (valorRejeitado) {
            valorRejeitado.textContent = "0.00 MT";
        }

        if (container) {

            container.innerHTML =
                '<p class="empty">Não foi possível carregar os pedidos.</p>';

        }

        return;

    }


    const lista =
        saques || [];


    /* =====================================================
       TOTAL DE UTILIZADORES
    ===================================================== */

    const {
        count: quantidadeUtilizadores,
        error: erroUtilizadores
    } =
        await supabaseClient
            .from("Utilizadores")
            .select(
                "id",
                {
                    count:
                        "exact",
                    head:
                        true
                }
            );


    if (erroUtilizadores) {

        console.error(
            "ERRO AO CONTAR UTILIZADORES:",
            erroUtilizadores
        );

        if (totalUtilizadores) {

            totalUtilizadores.textContent =
                "0";

        }

    } else {

        if (totalUtilizadores) {

            totalUtilizadores.textContent =
                quantidadeUtilizadores || 0;

        }

    }


    /* =====================================================
       QUANTIDADES
    ===================================================== */

    const quantidadePendentes =
        lista.filter(
            saque =>
                saque.estado ===
                "Pendente"
        ).length;


    const quantidadePagos =
        lista.filter(
            saque =>
                saque.estado ===
                "Pago"
        ).length;


    const quantidadeRejeitados =
        lista.filter(
            saque =>
                saque.estado ===
                "Rejeitado"
        ).length;


    /* =====================================================
       VALORES POR ESTADO
    ===================================================== */

    const totalPendente =
        lista
            .filter(
                saque =>
                    saque.estado ===
                    "Pendente"
            )
            .reduce(
                (
                    total,
                    saque
                ) =>
                    total +
                    Number(
                        saque.valor || 0
                    ),
                0
            );


    const totalPago =
        lista
            .filter(
                saque =>
                    saque.estado ===
                    "Pago"
            )
            .reduce(
                (
                    total,
                    saque
                ) =>
                    total +
                    Number(
                        saque.valor || 0
                    ),
                0
            );


    const totalRejeitado =
        lista
            .filter(
                saque =>
                    saque.estado ===
                    "Rejeitado"
            )
            .reduce(
                (
                    total,
                    saque
                ) =>
                    total +
                    Number(
                        saque.valor || 0
                    ),
                0
            );


    /* =====================================================
       RESUMO FINANCEIRO GERAL
    ===================================================== */

    const totalSolicitado =
        lista.reduce(
            (
                total,
                saque
            ) =>
                total +
                Number(
                    saque.valor || 0
                ),
            0
        );


    const totalDevolvido =
        lista
            .filter(
                saque =>
                    saque.estado ===
                    "Rejeitado"
            )
            .reduce(
                (
                    total,
                    saque
                ) =>
                    total +
                    Number(
                        saque.valor || 0
                    ),
                0
            );


    const totalAguardando =
        lista
            .filter(
                saque =>
                    saque.estado ===
                    "Pendente"
            )
            .reduce(
                (
                    total,
                    saque
                ) =>
                    total +
                    Number(
                        saque.valor || 0
                    ),
                0
            );


    /* =====================================================
       RESUMO FINANCEIRO POR MÉTODO
    ===================================================== */

    const mpesa =
        lista.filter(
            saque =>
                String(
                    saque.metodo || ""
                )
                    .trim()
                    .toLowerCase() ===
                "m-pesa"
        );


    const emola =
        lista.filter(
            saque =>
                String(
                    saque.metodo || ""
                )
                    .trim()
                    .toLowerCase() ===
                "e-mola"
        );


    /* =====================================================
       M-PESA
    ===================================================== */

    const mpesaSolicitado =
        mpesa.reduce(
            (
                total,
                saque
            ) =>
                total +
                Number(
                    saque.valor || 0
                ),
            0
        );


    const mpesaPago =
        mpesa
            .filter(
                saque =>
                    saque.estado ===
                    "Pago"
            )
            .reduce(
                (
                    total,
                    saque
                ) =>
                    total +
                    Number(
                        saque.valor || 0
                    ),
                0
            );


    const mpesaRejeitado =
        mpesa
            .filter(
                saque =>
                    saque.estado ===
                    "Rejeitado"
            )
            .reduce(
                (
                    total,
                    saque
                ) =>
                    total +
                    Number(
                        saque.valor || 0
                    ),
                0
            );


    const mpesaPendente =
        mpesa
            .filter(
                saque =>
                    saque.estado ===
                    "Pendente"
            )
            .reduce(
                (
                    total,
                    saque
                ) =>
                    total +
                    Number(
                        saque.valor || 0
                    ),
                0
            );


    /* =====================================================
       E-MOLA
    ===================================================== */

    const emolaSolicitado =
        emola.reduce(
            (
                total,
                saque
            ) =>
                total +
                Number(
                    saque.valor || 0
                ),
            0
        );


    const emolaPago =
        emola
            .filter(
                saque =>
                    saque.estado ===
                    "Pago"
            )
            .reduce(
                (
                    total,
                    saque
                ) =>
                    total +
                    Number(
                        saque.valor || 0
                    ),
                0
            );


    const emolaRejeitado =
        emola
            .filter(
                saque =>
                    saque.estado ===
                    "Rejeitado"
            )
            .reduce(
                (
                    total,
                    saque
                ) =>
                    total +
                    Number(
                        saque.valor || 0
                    ),
                0
            );


    const emolaPendente =
        emola
            .filter(
                saque =>
                    saque.estado ===
                    "Pendente"
            )
            .reduce(
                (
                    total,
                    saque
                ) =>
                    total +
                    Number(
                        saque.valor || 0
                    ),
                0
            );


    /* =====================================================
       QUANTIDADE POR MÉTODO
    ===================================================== */

    const elementoMPesaQtd =
        document.getElementById(
            "adminMPesaQtd"
        );

    const elementoMPesaValor =
        document.getElementById(
            "adminMPesaValor"
        );

    const elementoEMolaQtd =
        document.getElementById(
            "adminEMolaQtd"
        );

    const elementoEMolaValor =
        document.getElementById(
            "adminEMolaValor"
        );


    if (elementoMPesaQtd) {

        elementoMPesaQtd.textContent =
            mpesa.length;

    }


    if (elementoMPesaValor) {

        elementoMPesaValor.textContent =
            mpesaSolicitado.toFixed(2) +
            " MT";

    }


    if (elementoEMolaQtd) {

        elementoEMolaQtd.textContent =
            emola.length;

    }


    if (elementoEMolaValor) {

        elementoEMolaValor.textContent =
            emolaSolicitado.toFixed(2) +
            " MT";

    }


    /* =====================================================
       RESUMO GERAL NA TELA
    ===================================================== */

    const elementoTotalSolicitado =
        document.getElementById(
            "adminTotalSolicitado"
        );

    const elementoTotalPago =
        document.getElementById(
            "adminTotalPago"
        );

    const elementoTotalDevolvido =
        document.getElementById(
            "adminTotalDevolvido"
        );

    const elementoTotalAguardando =
        document.getElementById(
            "adminTotalAguardando"
        );


    if (elementoTotalSolicitado) {

        elementoTotalSolicitado.textContent =
            totalSolicitado.toFixed(2) +
            " MT";

    }


    if (elementoTotalPago) {

        elementoTotalPago.textContent =
            totalPago.toFixed(2) +
            " MT";

    }


    if (elementoTotalDevolvido) {

        elementoTotalDevolvido.textContent =
            totalDevolvido.toFixed(2) +
            " MT";

    }


    if (elementoTotalAguardando) {

        elementoTotalAguardando.textContent =
            totalAguardando.toFixed(2) +
            " MT";

    }


    /* =====================================================
       RESUMO POR MÉTODO NA TELA
    ===================================================== */

    const mpesaSolicitadoEl =
        document.getElementById(
            "mpesaSolicitado"
        );

    const mpesaPagoEl =
        document.getElementById(
            "mpesaPago"
        );

    const mpesaRejeitadoEl =
        document.getElementById(
            "mpesaRejeitado"
        );

    const mpesaPendenteEl =
        document.getElementById(
            "mpesaPendente"
        );


    const emolaSolicitadoEl =
        document.getElementById(
            "emolaSolicitado"
        );

    const emolaPagoEl =
        document.getElementById(
            "emolaPago"
        );

    const emolaRejeitadoEl =
        document.getElementById(
            "emolaRejeitado"
        );

    const emolaPendenteEl =
        document.getElementById(
            "emolaPendente"
        );


    if (mpesaSolicitadoEl) {

        mpesaSolicitadoEl.textContent =
            mpesaSolicitado.toFixed(2) +
            " MT";

    }


    if (mpesaPagoEl) {

        mpesaPagoEl.textContent =
            mpesaPago.toFixed(2) +
            " MT";

    }


    if (mpesaRejeitadoEl) {

        mpesaRejeitadoEl.textContent =
            mpesaRejeitado.toFixed(2) +
            " MT";

    }


    if (mpesaPendenteEl) {

        mpesaPendenteEl.textContent =
            mpesaPendente.toFixed(2) +
            " MT";

    }


    if (emolaSolicitadoEl) {

        emolaSolicitadoEl.textContent =
            emolaSolicitado.toFixed(2) +
            " MT";

    }


    if (emolaPagoEl) {

        emolaPagoEl.textContent =
            emolaPago.toFixed(2) +
            " MT";

    }


    if (emolaRejeitadoEl) {

        emolaRejeitadoEl.textContent =
            emolaRejeitado.toFixed(2) +
            " MT";

    }


    if (emolaPendenteEl) {

        emolaPendenteEl.textContent =
            emolaPendente.toFixed(2) +
            " MT";

    }


    /* =====================================================
       ESTATÍSTICAS GERAIS
    ===================================================== */

    if (total) {

        total.textContent =
            lista.length;

    }


    if (pendentes) {

        pendentes.textContent =
            quantidadePendentes;

    }


    if (pagos) {

        pagos.textContent =
            quantidadePagos;

    }


    if (rejeitados) {

        rejeitados.textContent =
            quantidadeRejeitados;

    }


    if (valorPendente) {

        valorPendente.textContent =
            totalPendente.toFixed(2) +
            " MT";

    }


    if (valorPago) {

        valorPago.textContent =
            totalPago.toFixed(2) +
            " MT";

    }


    if (valorRejeitado) {

        valorRejeitado.textContent =
            totalRejeitado.toFixed(2) +
            " MT";

    }


    /* =====================================================
       LISTA DE SAQUES
    ===================================================== */

    if (
        lista.length === 0
    ) {

        if (container) {

            container.innerHTML =
                '<p class="empty">Nenhum pedido encontrado.</p>';

        }

    } else {

        let html = "";


        for (
            const saque of lista
        ) {

            let username =
                "Utilizador #" +
                saque.utilizador_id;


            const {
                data: utilizadores
            } =
                await supabaseClient
                    .from("Utilizadores")
                    .select("username")
                    .eq(
                        "id",
                        saque.utilizador_id
                    )
                    .limit(1);


            if (
                utilizadores &&
                utilizadores.length > 0
            ) {

                username =
                    utilizadores[0].username;

            }


            let botoes = "";


            if (
                saque.estado ===
                "Pendente"
            ) {

                botoes = `

                    <button
                        onclick="alterarSaque(${saque.id}, 'Pago')"
                    >
                        ✅ Marcar Pago
                    </button>

                    <button
                        onclick="alterarSaque(${saque.id}, 'Rejeitado')"
                    >
                        ❌ Rejeitar
                    </button>

                `;

            }


            const dataFormatada =
                saque.created_at
                    ? new Date(
                        saque.created_at
                    ).toLocaleString(
                        "pt-PT"
                    )
                    : "-";


            html += `

                <div
                    class="admin-saque"
                    data-estado="${escaparHTML(
                        saque.estado || ""
                    )}"
                    data-metodo="${escaparHTML(
                        saque.metodo || ""
                    )}"
                >

                    <p>
                        <strong>ID:</strong>
                        SAQ-${saque.id}
                    </p>

                    <p>
                        <strong>Utilizador:</strong>
                        ${escaparHTML(
                            username
                        )}
                    </p>

                    <p>
                        <strong>Método:</strong>
                        ${escaparHTML(
                            saque.metodo || "-"
                        )}
                    </p>

                    <p>
                        <strong>Número:</strong>
                        ${escaparHTML(
                            saque.numero || "-"
                        )}
                    </p>

                    <p>
                        <strong>Valor:</strong>
                        ${Number(
                            saque.valor || 0
                        ).toFixed(2)} MT
                    </p>

                    <p>
                        <strong>Data:</strong>
                        ${escaparHTML(
                            dataFormatada
                        )}
                    </p>

                    <p>
                        <strong>Estado:</strong>

                        <span
                            class="${classeEstado(
                                saque.estado
                            )}"
                        >
                            ${escaparHTML(
                                saque.estado
                            )}
                        </span>

                    </p>

                    <div class="admin-actions">

                        ${botoes}

                    </div>

                </div>

            `;

        }


        if (container) {

            container.innerHTML =
                html;

        }

    }


    /* =====================================================
       CRESCIMENTO DE UTILIZADORES
    ===================================================== */

    const {
        data: utilizadoresCrescimento,
        error: erroCrescimento
    } =
        await supabaseClient
            .from("Utilizadores")
            .select("created_at");


    if (erroCrescimento) {

        console.error(
            "ERRO AO CARREGAR CRESCIMENTO:",
            erroCrescimento
        );

    } else {

        const agora =
            new Date();


        /* INÍCIO DE HOJE */

        const inicioHoje =
            new Date(
                agora
            );

        inicioHoje.setHours(
            0,
            0,
            0,
            0
        );


        /* ÚLTIMOS 7 DIAS */

        const inicio7Dias =
            new Date(
                agora
            );

        inicio7Dias.setDate(
            inicio7Dias.getDate() -
            7
        );


        /* ÚLTIMOS 30 DIAS */

        const inicio30Dias =
            new Date(
                agora
            );

        inicio30Dias.setDate(
            inicio30Dias.getDate() -
            30
        );


        const listaUtilizadores =
            utilizadoresCrescimento ||
            [];


        const novosHoje =
            listaUtilizadores.filter(
                utilizador =>
                    utilizador.created_at &&
                    new Date(
                        utilizador.created_at
                    ) >= inicioHoje
            ).length;


        const novos7Dias =
            listaUtilizadores.filter(
                utilizador =>
                    utilizador.created_at &&
                    new Date(
                        utilizador.created_at
                    ) >= inicio7Dias
            ).length;


        const novos30Dias =
            listaUtilizadores.filter(
                utilizador =>
                    utilizador.created_at &&
                    new Date(
                        utilizador.created_at
                    ) >= inicio30Dias
            ).length;


        const elementoNovosHoje =
            document.getElementById(
                "adminNovosHoje"
            );

        const elementoNovos7Dias =
            document.getElementById(
                "adminNovos7Dias"
            );

        const elementoNovos30Dias =
            document.getElementById(
                "adminNovos30Dias"
            );


        if (elementoNovosHoje) {

            elementoNovosHoje.textContent =
                novosHoje;

        }


        if (elementoNovos7Dias) {

            elementoNovos7Dias.textContent =
                novos7Dias;

        }


        if (elementoNovos30Dias) {

            elementoNovos30Dias.textContent =
                novos30Dias;

        }


        /* =================================================
           GRÁFICO DE CRESCIMENTO — 7 DIAS
        ================================================= */

        const graficoUtilizadores =
            document.getElementById(
                "graficoUtilizadores"
            );


        if (graficoUtilizadores) {

            const hoje =
                new Date();


            const dias = [];


            for (
                let i = 6;
                i >= 0;
                i--
            ) {

                const data =
                    new Date(
                        hoje
                    );


                data.setDate(
                    data.getDate() -
                    i
                );


                data.setHours(
                    0,
                    0,
                    0,
                    0
                );


                dias.push(
                    data
                );

            }


            const contagens =
                dias.map(
                    dataDia => {

                        const proximoDia =
                            new Date(
                                dataDia
                            );


                        proximoDia.setDate(
                            proximoDia.getDate() +
                            1
                        );


                        return listaUtilizadores.filter(
                            utilizador => {

                                if (
                                    !utilizador.created_at
                                ) {

                                    return false;

                                }


                                const dataUtilizador =
                                    new Date(
                                        utilizador.created_at
                                    );


                                return (
                                    dataUtilizador >=
                                        dataDia &&
                                    dataUtilizador <
                                        proximoDia
                                );

                            }
                        ).length;

                    }
                );


            const maiorValor =
                Math.max(
                    ...contagens,
                    1
                );


            let graficoHTML = "";


            dias.forEach(
                (
                    dataDia,
                    indice
                ) => {

                    const quantidade =
                        contagens[
                            indice
                        ];


                    const altura =
                        (
                            quantidade /
                            maiorValor
                        ) *
                        100;


                    const nomeDia =
                        dataDia.toLocaleDateString(
                            "pt-PT",
                            {
                                weekday:
                                    "short"
                            }
                        );


                    const numeroDia =
                        dataDia.getDate();


                    graficoHTML += `

                        <div class="grafico-dia">

                            <div class="grafico-valor">
                                ${quantidade}
                            </div>

                            <div class="grafico-coluna">

                                <div
                                    class="grafico-barra"
                                    style="height: ${Math.max(
                                        altura,
                                        4
                                    )}%;"
                                ></div>

                            </div>

                            <div class="grafico-label">
                                ${escaparHTML(
                                    nomeDia
                                )}<br>${numeroDia}
                            </div>

                        </div>

                    `;

                }
            );


            graficoUtilizadores.innerHTML = `

                <div class="grafico-barras">

                    ${graficoHTML}

                </div>

            `;

        }

    }

}


/* =========================================================
   ALTERAR SAQUE
========================================================= */

async function alterarSaque(
    saqueId,
    novoEstado
) {

    console.log(
        "ALTERAR SAQUE:",
        saqueId,
        novoEstado
    );


    if (
        novoEstado !== "Pago" &&
        novoEstado !== "Rejeitado"
    ) {

        alert(
            "Estado inválido."
        );

        return;

    }


    const {
        data: saque,
        error: erroBusca
    } =
        await supabaseClient
            .from("Saques")
            .select("*")
            .eq(
                "id",
                saqueId
            )
            .maybeSingle();


    if (erroBusca) {

        console.error(
            "ERRO AO BUSCAR SAQUE:",
            erroBusca
        );

        alert(
            "Erro ao buscar saque: " +
            erroBusca.message
        );

        return;

    }


    if (!saque) {

        alert(
            "Saque não encontrado."
        );

        return;

    }


    if (
        saque.estado !==
        "Pendente"
    ) {

        alert(
            "Este saque já está como " +
            saque.estado
        );

        return;

    }


    /* =====================================================
       ATUALIZAR ESTADO
    ===================================================== */

    const {
        error: erroEstado
    } =
        await supabaseClient
            .from("Saques")
            .update({

                estado:
                    novoEstado

            })
            .eq(
                "id",
                saqueId
            );


    if (erroEstado) {

        console.error(
            "ERRO AO ATUALIZAR SAQUE:",
            erroEstado
        );

        alert(
            "Erro do Supabase: " +
            erroEstado.message
        );

        return;

    }


    /* =====================================================
       DEVOLVER SALDO SE FOR REJEITADO
    ===================================================== */

    if (
        novoEstado ===
        "Rejeitado"
    ) {

        const {
            data: utilizador,
            error: erroUtilizador
        } =
            await supabaseClient
                .from("Utilizadores")
                .select("saldo")
                .eq(
                    "id",
                    saque.utilizador_id
                )
                .maybeSingle();


        if (erroUtilizador) {

            console.error(
                "ERRO AO BUSCAR SALDO:",
                erroUtilizador
            );

            alert(
                "O saque foi rejeitado, mas ocorreu um erro ao devolver o saldo: " +
                erroUtilizador.message
            );

            await atualizarPainelAdmin();

            return;

        }


        if (!utilizador) {

            alert(
                "Utilizador do saque não encontrado."
            );

            await atualizarPainelAdmin();

            return;

        }


        const novoSaldo =
            Number(
                utilizador.saldo || 0
            ) +
            Number(
                saque.valor || 0
            );


        const {
            error: erroDevolucao
        } =
            await supabaseClient
                .from("Utilizadores")
                .update({

                    saldo:
                        novoSaldo

                })
                .eq(
                    "id",
                    saque.utilizador_id
                );


        if (erroDevolucao) {

            console.error(
                "ERRO AO DEVOLVER SALDO:",
                erroDevolucao
            );

            alert(
                "Saque rejeitado, mas não foi possível devolver o saldo automaticamente."
            );

            await atualizarPainelAdmin();

            return;

        }

    }


    console.log(
        "SAQUE ATUALIZADO COM SUCESSO"
    );


    alert(
        "Saque atualizado para: " +
        novoEstado
    );


    await atualizarPainelAdmin();

}


/* =========================================================
   ESTADOS
========================================================= */

function classeEstado(
    estado
) {

    if (
        estado ===
        "Pago"
    ) {

        return "status-pago";

    }


    if (
        estado ===
        "Rejeitado"
    ) {

        return "status-rejeitado";

    }


    return "status-pendente";

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(
        valor
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   TELAS
========================================================= */

function esconderTodasTelas() {

    const auth =
        document.getElementById(
            "authScreen"
        );


    const app =
        document.getElementById(
            "appScreen"
        );


    const admin =
        document.getElementById(
            "adminScreen"
        );


    if (auth) {

        auth.classList.add(
            "hidden"
        );

    }


    if (app) {

        app.classList.add(
            "hidden"
        );

    }


    if (admin) {

        admin.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   FILTROS DO PAINEL ADMIN
========================================================= */

function filtrarSaquesAdmin() {

    const pesquisaInput =
        document.getElementById(
            "adminPesquisa"
        );


    const filtroEstado =
        document.getElementById(
            "adminFiltroEstado"
        );


    const filtroMetodo =
        document.getElementById(
            "adminFiltroMetodo"
        );


    const pesquisa =
        (
            pesquisaInput?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const estadoSelecionado =
        filtroEstado?.value ||
        "Todos";


    const metodoSelecionado =
        filtroMetodo?.value ||
        "Todos";


    const pedidos =
        document.querySelectorAll(
            ".admin-saque"
        );


    pedidos.forEach(
        pedido => {

            const texto =
                pedido.textContent
                    .toLowerCase();


            /* PESQUISA */

            const correspondePesquisa =
                pesquisa === "" ||
                texto.includes(
                    pesquisa
                );


            /* ESTADO */

            let correspondeEstado =
                true;


            if (
                estadoSelecionado !==
                "Todos"
            ) {

                const estadoPedido =
                    pedido.dataset.estado ||
                    "";


                correspondeEstado =
                    estadoPedido ===
                    estadoSelecionado;

            }


            /* MÉTODO */

            let correspondeMetodo =
                true;


            if (
                metodoSelecionado !==
                "Todos"
            ) {

                const metodoPedido =
                    (
                        pedido.dataset.metodo ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                correspondeMetodo =
                    metodoPedido ===
                    metodoSelecionado
                        .trim()
                        .toLowerCase();

            }


            /* RESULTADO */

            if (
                correspondePesquisa &&
                correspondeEstado &&
                correspondeMetodo
            ) {

                pedido.style.display =
                    "";

            } else {

                pedido.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   LIMPAR FILTROS
========================================================= */

function limparFiltrosAdmin() {

    const pesquisa =
        document.getElementById(
            "adminPesquisa"
        );


    const estado =
        document.getElementById(
            "adminFiltroEstado"
        );


    const metodo =
        document.getElementById(
            "adminFiltroMetodo"
        );


    if (pesquisa) {

        pesquisa.value =
            "";

    }


    if (estado) {

        estado.value =
            "Todos";

    }


    if (metodo) {

        metodo.value =
            "Todos";

    }


    document
        .querySelectorAll(
            ".admin-saque"
        )
        .forEach(
            pedido => {

                pedido.style.display =
                    "";

            }
        );

}


/* =========================================================
   FUNÇÕES GLOBAIS PARA O HTML
========================================================= */

// ==================== SISTEMA DE CONVITES V3.8 ====================

async function gerarCodigoConvite() {

    if (!contaAtual) return;

    try {

        const {
            data: utilizador,
            error: erroBusca
        } = await supabaseClient
            .from("Utilizadores")
            .select("codigo_convite, total_convites, pontos_convite")
            .eq("id", contaAtual.id)
            .maybeSingle();

        if (erroBusca) {

            console.error(
                "ERRO AO BUSCAR CONVITE:",
                erroBusca
            );

            return;
        }

        let codigo =
            utilizador?.codigo_convite;


        if (!codigo) {

            codigo =
                "MZ" +
                Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase();


            const {
                error: erroAtualizacao
            } = await supabaseClient
                .from("Utilizadores")
                .update({
                    codigo_convite: codigo
                })
                .eq("id", contaAtual.id);


            if (erroAtualizacao) {

                console.error(
                    "ERRO AO GUARDAR CÓDIGO:",
                    erroAtualizacao
                );

                return;
            }
        }


        const codigoEl =
            document.getElementById("codigoConvite");

        const totalEl =
            document.getElementById("totalConvites");

        const pontosEl =
            document.getElementById("pontosConvite");


        if (codigoEl) {

            codigoEl.textContent =
                codigo;

        }


        if (totalEl) {

            totalEl.textContent =
                utilizador?.total_convites || 0;

        }


        if (pontosEl) {

            pontosEl.textContent =
                utilizador?.pontos_convite || 0;

        }


    } catch (erro) {

        console.error(
            "ERRO NO SISTEMA DE CONVITES:",
            erro
        );

    }

}

async function copiarCodigoConvite() {

    const codigoEl =
        document.getElementById("codigoConvite");

    if (!codigoEl) {
        alert("Código de convite não encontrado.");
        return;
    }

    const codigo =
        codigoEl.textContent.trim();

    if (!codigo || codigo === "Gerando...") {
        alert("O código ainda está sendo gerado.");
        return;
    }

    try {

        await navigator.clipboard.writeText(codigo);

        alert("✅ Código copiado com sucesso!");

    } catch (erro) {

        const campo =
            document.createElement("textarea");

        campo.value = codigo;

        campo.style.position = "fixed";
        campo.style.opacity = "0";

        document.body.appendChild(campo);

        campo.focus();
        campo.select();

        try {

            document.execCommand("copy");

            alert("✅ Código copiado com sucesso!");

        } catch (erroCopia) {

            alert(
                "Copie manualmente este código: " +
                codigo
            );

        }

        document.body.removeChild(campo);
    }
}

async function partilharConvite() {

    const codigoEl =
        document.getElementById("codigoConvite");

    if (!codigoEl) {
        alert("Código de convite não encontrado.");
        return;
    }

    const codigo =
        codigoEl.textContent.trim();

    if (!codigo || codigo === "Gerando...") {
        alert("O código ainda está sendo gerado.");
        return;
    }

    const link =
        window.location.href.split("?")[0] +
        "?convite=" +
        encodeURIComponent(codigo);

    const mensagem =
        "🎁 Ganhar Dinheiro\n\n" +
        "Junte-se usando o meu convite e ganhe pontos!\n\n" +
        "Código: " + codigo +
        "\n\nLink: " + link;

    if (navigator.share) {

        try {

            await navigator.share({
                title: "Ganhar Dinheiro",
                text: mensagem
            });

        } catch (erro) {

            console.log(
                "Partilha cancelada:",
                erro
            );

        }

    } else {

        try {

            await navigator.clipboard.writeText(
                mensagem
            );

            alert(
                "✅ Convite copiado! Agora pode enviar aos seus amigos."
            );

        } catch (erro) {

            alert(mensagem);

        }

    }
}

async function processarConvite() {

    const codigo =
        localStorage.getItem(
            "codigoConvitePendente"
        );

    if (!codigo || !contaAtual) {
        return;
    }

    try {

        const {
            data: convidador,
            error: erroBusca
        } = await supabaseClient
            .from("Utilizadores")
            .select(
                "id, total_convites, pontos_convite, pontos"
            )
            .eq(
                "codigo_convite",
                codigo
            )
            .maybeSingle();

        if (erroBusca) {
            console.error(
                "ERRO AO PROCURAR CONVIDADOR:",
                erroBusca
            );
            return;
        }

        if (!convidador) {
            console.log(
                "Código de convite inválido."
            );
            return;
        }

        if (
            convidador.id ===
            contaAtual.id
        ) {
            console.log(
                "Auto-convite bloqueado."
            );

            localStorage.removeItem(
                "codigoConvitePendente"
            );

            return;
        }

        if (contaAtual.convidado_por) {
            localStorage.removeItem(
                "codigoConvitePendente"
            );

            return;
        }

        const {
            error: erroConvidado
        } = await supabaseClient
            .from("Utilizadores")
            .update({
                convidado_por:
                    convidador.id
            })
            .eq(
                "id",
                contaAtual.id
            );

        if (erroConvidado) {
            console.error(
                "ERRO AO REGISTAR CONVITE:",
                erroConvidado
            );
            return;
        }

        const novosPontos =
            (convidador.pontos || 0) + 50;

        const novoTotalConvites =
            (convidador.total_convites || 0) + 1;

        const novosPontosConvite =
            (convidador.pontos_convite || 0) + 50;

        const {
            error: erroRecompensa
        } = await supabaseClient
            .from("Utilizadores")
            .update({
                pontos:
                    novosPontos,

                total_convites:
                    novoTotalConvites,

                pontos_convite:
                    novosPontosConvite
            })
            .eq(
                "id",
                convidador.id
            );

        if (erroRecompensa) {
            console.error(
                "ERRO AO DAR RECOMPENSA:",
                erroRecompensa
            );
            return;
        }

        localStorage.removeItem(
            "codigoConvitePendente"
        );

        console.log(
            "✅ Convite processado: +50 pontos"
        );

        alert(
            "🎉 Convite processado! O convidador recebeu 50 pontos."
        );

    } catch (erro) {

        console.error(
            "ERRO NO SISTEMA DE CONVITES:",
            erro
        );

    }
}

globalThis.criarConta =
    criarConta;

globalThis.copiarCodigoConvite =
    copiarCodigoConvite;

globalThis.partilharConvite =
    partilharConvite;

globalThis.entrar =
    entrar;

globalThis.sair =
    sair;

globalThis.assistirVideo =
    assistirVideo;

globalThis.converterPontos =
    converterPontos;

globalThis.solicitarSaque =
    solicitarSaque;

globalThis.mostrarLogin =
    mostrarLogin;

globalThis.mostrarCadastro =
    mostrarCadastro;

globalThis.mostrarAdmin =
    mostrarAdmin;

globalThis.entrarAdmin =
    entrarAdmin;

globalThis.abrirPainelAdmin =
    abrirPainelAdmin;

globalThis.sairAdmin =
    sairAdmin;

globalThis.alterarSaque =
    alterarSaque;

globalThis.filtrarSaquesAdmin =
    filtrarSaquesAdmin;

globalThis.limparFiltrosAdmin =
    limparFiltrosAdmin;

globalThis.mostrarSecao =
    mostrarSecao;


/* =========================================================
   TESTE DE CARREGAMENTO
========================================================= */

console.log(
    "SCRIPT GANHAR DINHEIRO V3.7 CARREGADO COM SUCESSO"
);