const { createApp } = Vue

createApp({
    data() {
        return {
            heroi: {vida: 100},
            vilao: {vida: 100},
            defesaV: false,
            defesaH: false,
            turno: true,
            turnonum: 0,
            heros:[
                {nome: "Cavalheiro", 
                historico:[],
                expanded: false},
                {nome: "Dragão",
                historico: [],
                expanded: false},
            ]
        }
    },
    methods: {
        expandirItem(item){
            item.expanded = !item.expanded
        },
        async atualizarVidaServidor() {
            try {
                const response = await fetch('https://aplicacao-web-com-bd-relacional.onrender.com/api/atualizarVida', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        vidaHeroi: this.heroi.vida,
                        vidaVilao: this.vilao.vida
                    })
                });
                const data = await response.json();
                console.log(data); 
            } catch (error) {
                console.error('Erro ao atualizar a vida no servidor:', error);
            }
        },
        turnoh(){
            this.turno = true;
        },
        turnov(){
            this.turno = false;
            this.acaoVilao();
        },
        atacar(atacante, atacado) {
            let mensagem = "";
            if(atacado == this.heroi && this.defesaH){
                mensagem = "Herói bloqueou o ataque!!";
                this.registrohistorico(this.heros[0],mensagem);
                this.defesaH = false;
            }else if(atacado == this.vilao && this.defesaV){
                mensagem = "O vilão bloqueou o ataque!!";
                this.registrohistorico(this.heros[1],mensagem);
                this.defesaV = false;
            }else{
                if(atacante == this.heroi){
                    atacado.vida -= 10;
                    this.atualizarVidaServidor();
                    mensagem = "Herói atacou.";
                    this.registrohistorico(this.heros[0],mensagem);
                    this.turnov();
                }else{
                    atacado.vida -= 20;
                    this.atualizarVidaServidor();
                    mensagem = "Vilão atacou.";
                    this.registrohistorico(this.heros[1],mensagem);
                }
            }
        },
        defender(defensor) {
            if(defensor == this.heroi){
                this.defesaH = true;
                mensagem = "Herói está em postuda defensiva!!";
                this.registrohistorico(this.heros[0],mensagem);
                this.turnov();
            }else if(defensor == this.vilao){
                this.defesaV = true;
                mensagem = "Vilão está em postuda defensiva!!";
                this.registrohistorico(this.heros[1],mensagem);
            }
            this.registrohistorico(defensor,mensagem);
        },
        usarPocao(perso) {
            if(perso === this.heroi){
                mensagem = "Herói usou poção de cura!";
                this.registrohistorico(this.heros[0],mensagem);
                perso.vida += 10;
                this.atualizarVidaServidor();
                if (perso.vida >= 100){
                    perso.vida = 100;
                }
                this.turnov();
            }else{
                mensagem = "Vilão usou poção de cura!";
                this.registrohistorico(this.heros[1],mensagem);
                perso.vida += 10;
                this.atualizarVidaServidor();
                if (perso.vida >= 100){
                    perso.vida = 100;
                }
            }
            this.registrohistorico(perso,mensagem);
        },
        correr(corre) {
            const chances = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'fugiu'];
            const chancealeatoria = chances[Math.floor(Math.random() * chances.length)];
            if(chancealeatoria === 'fugiu'){
                if(corre === this.heroi){
                    mensagem = "O herói não era tão heroico e covardemente conseguiu fugir!";
                    this.registrohistorico(this.heros[0],mensagem);
                    corre.vida -= 999;
                }else{
                    mensagem = "O vilão sentiu sua força e covardemente conseguiu fugir!";
                    this.registrohistorico(this.heros[1],mensagem);
                    corre.vida -= 999;
                }
            }else{
                if(corre === this.heroi){
                    mensagem = "O herói não conseguiu fugir, enfrente seu inimigo!";
                    this.registrohistorico(this.heros[0],mensagem);
                    this.turnov();
                }else{
                    mensagem = "O vilão não conseguiu fugir, enfrente seu inimigo!";
                    this.registrohistorico(this.heros[1],mensagem);
                }
            }
        },
        acaoVilao() {
            const acoes = ['atacar','atacar','atacar','atacar','defender','defender', 'usarPocao','usarPocao', 'correr'];
            const acaoAleatoria = acoes[Math.floor(Math.random() * acoes.length)];
            this[acaoAleatoria](this.vilao, this.heroi);
        },
        registrohistorico(personagem,mensagem){
            console.log(personagem)
            personagem.historico.push(mensagem);    
        },
        reiniciarGame() {
            window.location.reload(); 
        }
    },
    mounted() {
        window.addEventListener('beforeunload', async () => {
            await this.atualizarVidaServidor();
        });
    }
}).mount("#app")
