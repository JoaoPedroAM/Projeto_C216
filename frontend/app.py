from flask import Flask, render_template, request, redirect, url_for
import requests
import os

app = Flask(__name__)

# Definindo as variáveis de ambiente
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:5000/api/v1/jogo")
API_DATABASE_RESET = os.getenv("API_DATABASE_RESET", "http://localhost:5000/api/v1/database/reset") 

# Rota para a página inicial
@app.route('/')
def index():
    return render_template('inserir.html')

# Rota para exibir o formulário de cadastro
@app.route('/inserir', methods=['GET'])
def inserir_jogo_form():
    return render_template('inserir.html')

# Rota para enviar os dados do formulário de cadastro para a API
@app.route('/inserir', methods=['POST'])
def inserir_jogo():
    nome = request.form['nome']
    genero = request.form['genero']
    valor = request.form['valor']
    plataformas = request.form['plataforma']
    zerado = True if request.form.get('zerado') else False

    payload = {
        'nome': nome,
        'genero': genero,
        'valor': valor,
        'plataforma': plataformas,
        'zerado': zerado
    }

    response = requests.post(f'{API_BASE_URL}/inserir', json=payload)
    
    if response.status_code == 201:
        return redirect(url_for('listar_jogos'))
    else:
        return "Erro ao inserir jogo", 500

# Rota para listar todos os jogos
@app.route('/listar', methods=['GET'])
def listar_jogos():
    # Obter o parâmetro de consulta 'sort' da URL
    sort_order = request.args.get('sort')

    # Realizar a requisição à API para obter a lista de jogos
    response = requests.get(f'{API_BASE_URL}/listar')
    jogos = response.json()

    # Verificar se o parâmetro 'sort' foi passado e aplicar a ordenação se necessário
    if sort_order == 'asc':
        jogos = sorted(jogos, key=lambda jogo: jogo['valor'])
    elif sort_order == 'desc':
        jogos = sorted(jogos, key=lambda jogo: jogo['valor'], reverse=True)

    # Renderizar o template com a lista de jogos ordenada
    return render_template('listar.html', jogos=jogos)

# Rota para exibir o formulário de edição de jogo
@app.route('/atualizar/<int:jogo_id>', methods=['GET'])
def atualizar_jogo_form(jogo_id):
    response = requests.get(f"{API_BASE_URL}/listar")
    # Filtrando apenas o jogo correspondente ao ID
    jogos = [jogo for jogo in response.json() if jogo['id'] == jogo_id]
    if len(jogos) == 0:
        return "Jogo não encontrado", 404
    jogo = jogos[0]
    return render_template('atualizar.html', jogo=jogo)

# Rota para enviar os dados do formulário de edição de jogo para a API
@app.route('/atualizar/<int:jogo_id>', methods=['POST'])
def atualizar_jogo(jogo_id):
    nome = request.form['nome']
    genero = request.form['genero']
    valor = request.form['valor']
    plataformas = request.form['plataforma']
    zerado = True if request.form.get('zerado') else False

    payload = {
        'id': jogo_id,
        'nome': nome,
        'genero': genero,
        'valor': valor,
        'plataforma': plataformas,
        'zerado': zerado
    }

    response = requests.post(f"{API_BASE_URL}/atualizar", json=payload)
    
    if response.status_code == 200:
        return redirect(url_for('listar_jogos'))
    else:
        return "Erro ao atualizar jogo", 500

# Rota para excluir um jogo
@app.route('/excluir/<int:jogo_id>', methods=['POST'])
def excluir_jogo(jogo_id):
    payload = {'id': jogo_id}

    response = requests.post(f"{API_BASE_URL}/excluir", json=payload)
    
    if response.status_code == 200:
        return redirect(url_for('listar_jogos'))
    else:
        return "Erro ao excluir jogo", 500


if __name__ == '__main__':
    app.run(debug=True, port=3000, host='0.0.0.0')
