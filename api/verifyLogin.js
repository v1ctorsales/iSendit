import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Importa bcrypt para comparação de senhas

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function verifyLogin(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        try {
            console.log('Tentativa de login com:', { username });

            // Busca o hash da senha no banco de dados baseado no username (email)
            const { data: user, error } = await supabase
                .from('empresas')
                .select('uuid, email, destinataria, senha') // Seleciona 'senha' para verificar com bcrypt
                .eq('email', username)
                .single();

            console.log('Resultado da consulta ao Supabase:', { user, error });

            // Verifica se o usuário existe e se ocorreu algum erro
            if (error || !user) {
                console.error('Usuário ou senha incorretos', { error });
                return res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
            }

            // Compara a senha fornecida com o hash armazenado no banco
            const isPasswordValid = await bcrypt.compare(password, user.senha);

            if (!isPasswordValid) {
                console.error('Senha incorreta');
                return res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
            }

            // Sucesso na autenticação, gerar o token JWT com o valor de 'destinataria'
            const token = jwt.sign(
                { 
                    userId: user.uuid, 
                    email: user.email, 
                    destinataria: user.destinataria  // Inclui 'destinataria' no token
                }, 
                SECRET_KEY, 
                { expiresIn: '1h' }
            );

            console.log('Token JWT gerado:', token);

            // Retornar o token e o valor 'destinataria' para o frontend
            return res.status(200).json({ 
                success: true, 
                token, 
                message: 'Autenticação bem-sucedida', 
                uuid: user.uuid, 
                destinataria: user.destinataria // Retorna 'destinataria' explicitamente
            });
        } catch (error) {
            console.error('Erro ao processar a autenticação:', error.message);
            return res.status(500).json({ success: false, message: 'Erro ao autenticar', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
