const Login = {
    template: `
        <div class="wrapper">
            <form @submit.prevent="login">
                <h1>Login</h1>
                <div class="input-box">
                    <input type="text" v-model="usuario" placeholder="Nome de usuário" required>
                    <i class="uil uil-user"></i>
                </div>
                <div class="input-box">
                    <input type="password" v-model="senha" placeholder="Senha" required>
                    <i class="uil uil-lock"></i>
                </div>
                <button type="submit" class="botao">Login</button>
                <div class="registro">
                    <p>Não tem uma conta?⠀<a href="#" @click="mudarParaSignup">Registre-se</a></p>
                </div>
            </form>
        </div>`,
    data() {
        return {
            usuario: '',
            senha: ''
        };
    },
    methods: {
        async login() {
            console.log('Tentando fazer login com:', this.usuario, this.senha); // Log de depuração
            try {
                const response = await fetch('https://aplicacao-web-com-bd-relacional.onrender.com/logar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: this.usuario, password: this.senha }) // Certifique-se de que os nomes dos campos correspondem aos esperados no servidor
                });
        
                const data = await response.json();
                if (response.ok) {
                    window.location.href = 'https://aplicacao-web-com-bd-relacional.onrender.com/jogo.html'; // Redirecionar para o dashboard após login bem-sucedido
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error('Erro ao tentar fazer login:', error);
                alert('Erro ao tentar fazer login.');
            }
        },
        mudarParaSignup() {
            this.$emit('change-template', 'Signup');
        }
    }
};

const Signup = {
    template: `
        <div class="wrapper">
            <form @submit.prevent="signup">
                <h1>Register</h1>
                <div class="input-box">
                    <input type="text" v-model="usuario" placeholder="Nome de usuário" required>
                    <i class="uil uil-user"></i>
                </div>
                <div class="input-box">
                    <input type="password" v-model="senha" placeholder="Senha" required>
                    <i class="uil uil-lock"></i>
                </div>
                <button type="submit" class="botao">Confirm</button>
                <div class="registro">
                    <p>Já tem uma conta?⠀<a href="#" @click="mudarParaLogin">Login</a></p>
                </div>
            </form>
        </div>`,
    data() {
        return {
            usuario: '',
            senha: ''
        };
    },
    methods: {
        async signup() {
            console.log('Tentando registrar com:', this.usuario, this.senha); // Log de depuração
            try {
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: this.usuario, password: this.senha })
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Usuário registrado com sucesso!');
                    this.mudarParaLogin();
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error('Erro ao tentar registrar:', error);
                alert('Erro ao tentar registrar.');
            }
        },
        mudarParaLogin() {
            this.$emit('change-template', 'Login');
        }
    }
};

const { createApp } = Vue;

createApp({
    data() {
        return {
            atual: "Login"
        };
    },
    methods: {
        mudarTemplate(novoTemplate) {
            this.atual = novoTemplate;
        }
    },
    components: {
        Login,
        Signup
    },
    template: `
    <transition name="fade" mode="out-in">
        <component :is="atual" @change-template="mudarTemplate"></component>
    </transition>
    `
}).mount("#app");
