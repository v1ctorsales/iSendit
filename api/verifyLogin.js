import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Configuração do Supabase 4847d08b-0582-452d-a966-c7d48c54162c
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function verifyLogin(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        try {
            console.log('Tentativa de login com:', { username, password });

            const { data: user, error } = await supabase
                .from('empresas')
                .select('*')
                .eq('email', username)
                .eq('senha', password)
                .single(); // Usar .single() garante que apenas uma linha será retornada.

            console.log('Resultado da consulta ao Supabase:', { user, error });

            if (error || !user) {
                console.error('Usuário ou senha incorretos', { error });
                return res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
            }

            // Sucesso na autenticação, gerar o token JWT
            const token = jwt.sign({ userId: user.uuid, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

            console.log('Token JWT gerado:', token);

            // Retornar o token para o frontend
            return res.status(200).json({ success: true, token, message: 'Autenticação bem-sucedida', uuid: user.uuid });
        } catch (error) {
            console.error('Erro ao processar a autenticação:', error.message);
            return res.status(500).json({ success: false, message: 'Erro ao autenticar', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
