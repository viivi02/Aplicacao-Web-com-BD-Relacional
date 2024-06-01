const express = require('express');
const path = require('path');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// Configuração do banco de dados
const config = {
    user: 'vinicius',
    password: 'Melancia@2',
    server: 'bd-fatec.database.windows.net',
    database: 'estudos-fatec',
    options: {
        encrypt: true // Dependendo da configuração do seu servidor SQL Server
    }
};

app.use(express.json());
app.use(cors());

// Servir arquivos estáticos (como index.html)
app.use(express.static(path.join(__dirname, )));

// Rota para atualizar a vida do herói e do vilão
app.post('/atualizarVida', async (req, res) => {
    const { vidaHeroi, vidaVilao } = req.body;
    console.log('Recebido POST para atualizar vida:', { vidaHeroi, vidaVilao });

    try {
        await sql.connect(config);
        const request = new sql.Request();
        await request.query(`
      MERGE INTO Personagens AS target
      USING (VALUES ('heroi', ${vidaHeroi}), ('vilao', ${vidaVilao})) AS source (Nome, Vida)
      ON target.Nome = source.Nome
      WHEN MATCHED THEN
        UPDATE SET Vida = source.Vida
      WHEN NOT MATCHED THEN
        INSERT (Nome, Vida) VALUES (source.Nome, source.Vida);
      `);
        res.status(200).send('Vida do herói e do vilão atualizada com sucesso.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar a vida do herói e do vilão.');
    }
});

// Rota para fornecer os dados do herói e do vilão
app.get('/characters', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        // Consulta para obter os dados do herói
        const heroResult = await request.query("SELECT * FROM Personagens WHERE Nome = 'heroi'");
        const heroi = heroResult.recordset[0];

        // Consulta para obter os dados do vilão
        const villainResult = await request.query("SELECT * FROM Personagens WHERE Nome = 'vilao'");
        const vilao = villainResult.recordset[0];

        res.json({ heroi, vilao });
    } catch (error) {
        console.error('Erro ao buscar dados do herói e do vilão:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do herói e do vilão.' });
    }
});

// Rota para autenticação de login
app.post('/logar', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT senha FROM Login WHERE usuario = @username');

        if (result.recordset.length > 0) {
            const hashedPassword = result.recordset[0].senha;

            // Verificar se a senha fornecida corresponde ao hash no banco de dados
            const passwordMatch = await bcrypt.compare(password, hashedPassword);
            if (passwordMatch) {
                res.status(200).json({ message: 'Login bem-sucedido' });
            } else {
                res.status(401).json({ error: 'Credenciais inválidas' });
            }
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }
    } catch (err) {
        console.error('Erro ao verificar credenciais:', err);
        res.status(500).json({ error: 'Erro ao verificar credenciais' });
    }
});

// Rota para registrar um novo usuário (signup)
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash da senha
        const pool = await sql.connect(config);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, hashedPassword)
            .query('INSERT INTO Login (usuario, senha) VALUES (@username, @password)');
        
        res.status(200).json({ message: 'Usuário registrado com sucesso!' });
    } catch (err) {
        console.error('Erro ao registrar usuário:', err);
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
});


// Rota para servir o arquivo HTML principal
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'jogo.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/', (req, res) => {
    console.log('Rota / acessada');
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login', (req, res) => {
    console.log('Rota /login acessada');
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});
