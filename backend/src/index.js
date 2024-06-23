const restify = require('restify');
const { Pool } = require('pg');

// Configurações do banco de dados
const pool = new Pool({
    user: 'postgres',
    host: 'db',
    database: 'jogos',
    password: 'password',
    port: 5432,
});

// Função para inicializar o banco de dados
async function initDatabase() {
    try {
        await pool.query('DROP TABLE IF EXISTS jogos');
        await pool.query('CREATE TABLE IF NOT EXISTS jogos (id SERIAL PRIMARY KEY, nome VARCHAR(255) NOT NULL, genero VARCHAR(255) NOT NULL, valor VARCHAR(255) NOT NULL, plataforma VARCHAR(255) NOT NULL, zerado BOOLEAN)');
        console.log('Banco de dados inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao iniciar o banco de dados, tentando novamente em 5 segundos:', error);
        setTimeout(initDatabase, 5000);
    }
}

const server = restify.createServer();

server.use(restify.plugins.bodyParser());

server.post('/api/v1/jogo/inserir', async (req, res, next) => {
    const { nome, genero, valor, plataforma, zerado } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO jogos (nome, genero, valor, plataforma, zerado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nome, genero, valor, plataforma, zerado]
        );
        res.send(201, result.rows[0]);
        console.log('Jogo inserido com sucesso:', result.rows[0]);
    } catch (error) {
        console.error('Erro ao inserir jogo:', error);
        res.send(500, { message: 'Erro ao inserir jogo' });
    }
    return next();
});

server.get('/api/v1/jogo/listar', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM jogos');
        res.send(result.rows);
        console.log('Jogos encontrados:', result.rows);
    } catch (error) {
        console.error('Erro ao listar jogos:', error);
        res.send(500, { message: 'Erro ao listar jogos' });
    }
    return next();
});

server.post('/api/v1/jogo/atualizar', async (req, res, next) => {
    const { id, nome, genero, valor, plataforma, zerado } = req.body;

    try {
        const result = await pool.query(
            'UPDATE jogos SET nome = $1, genero = $2, valor = $3, plataforma = $4, zerado = $5 WHERE id = $6 RETURNING *',
            [nome, genero, valor, plataforma, zerado, id]
        );
        if (result.rowCount === 0) {
            res.send(404, { message: 'Jogo não encontrado' });
        } else {
            res.send(200, result.rows[0]);
            console.log('Jogo atualizado com sucesso:', result.rows[0]);
        }
    } catch (error) {
        console.error('Erro ao atualizar jogo:', error);
        res.send(500, { message: 'Erro ao atualizar jogo' });
    }

    return next();
});

server.post('/api/v1/jogo/excluir', async (req, res, next) => {
    const { id } = req.body;

    try {
        const result = await pool.query('DELETE FROM jogos WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            res.send(404, { message: 'Jogo não encontrado' });
        } else {
            res.send(200, { message: 'Jogo excluído com sucesso' });
            console.log('Jogo excluído com sucesso');
        }
    } catch (error) {
        console.error('Erro ao excluir jogo:', error);
        res.send(500, { message: 'Erro ao excluir jogo' });
    }

    return next();
});

server.del('/api/v1/database/reset', async (req, res, next) => {
    try {
        await pool.query('DROP TABLE IF EXISTS jogos');
        await pool.query('CREATE TABLE jogos (id SERIAL PRIMARY KEY, nome VARCHAR(255) NOT NULL, genero VARCHAR(255) NOT NULL, valor VARCHAR(255) NOT NULL, plataforma VARCHAR(255) NOT NULL, zerado BOOLEAN)');
        res.send(200, { message: 'Banco de dados resetado com sucesso' });
        console.log('Banco de dados resetado com sucesso');
    } catch (error) {
        console.error('Erro ao resetar o banco de dados:', error);
        res.send(500, { message: 'Erro ao resetar o banco de dados' });
    }

    return next();
});

const port = process.env.PORT || 5000;

server.listen(port, function() {
    console.log('Servidor iniciado', server.name, ' na url http://localhost:' + port);
    console.log('Iniciando o banco de dados');
    initDatabase();
});
