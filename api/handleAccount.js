import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configurações de e-mail
const supabaseEmailPw = process.env.EMAIL_PW;
const supabaseEmail = process.env.EMAIL;

// Chave secreta para assinar o token
const JWT_SECRET = process.env.JWT_SECRET;

// URL base para o reset link
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default async function handleAccount(req, res) {
    const { action, email, token, newPassword, username, password } = req.body;

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    if (action === 'validateToken') {
        try {
            jwt.verify(token, JWT_SECRET);
            return res.status(200).json({ valid: true });
        } catch (error) {
            console.error('Token inválido ou expirado:', error);
            return res.status(400).json({ valid: false });
        }
    }

    if (action === 'forgetPassword') {
        const { data, error } = await supabase
            .from('empresas')
            .select('email')
            .eq('email', email)
            .single();

        if (error || !data) {
            return res.status(200).json({ message: 'Se esse email estiver cadastrado, as instruções de recuperação foram enviadas com sucesso!' });
        }

        const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '30m' });
        const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: supabaseEmail, pass: supabaseEmailPw },
        });

        const mailOptions = {
            from: supabaseEmail,
            to: email,
            subject: 'Recuperação de Senha',
            html: `
                <h1>Recuperação de Senha</h1>
                <p>Você solicitou a recuperação de senha. Clique no link abaixo para resetar sua senha:</p>
                <a href="${resetLink}" style="color: #4CAF50;">Resetar senha</a>
                <p>Este link é válido por 30 minutos. Se você não fez essa solicitação, ignore este e-mail.</p>
            `,
        };

        return transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Erro ao enviar e-mail:', err);
                return res.status(500).json({ message: 'Erro ao enviar o e-mail de recuperação' });
            } else {
                console.log('E-mail enviado:', info.response);
                return res.status(200).json({ message: 'Se esse email estiver cadastrado, as instruções de recuperação foram enviadas com sucesso!' });
            }
        });
    }

    if (action === 'setNewPassword') {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const emailFromToken = decoded.email;

            const { data, error } = await supabase
                .from('empresas')
                .select('email')
                .eq('email', emailFromToken)
                .single();

            if (error || !data) {
                return res.status(400).json({ message: 'Token inválido ou expirado.' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const { error: updateError } = await supabase
                .from('empresas')
                .update({ senha: hashedPassword })
                .eq('email', emailFromToken);

            if (updateError) {
                console.error('Erro ao atualizar a senha:', updateError);
                return res.status(500).json({ message: 'Erro ao atualizar a senha.' });
            }

            return res.status(200).json({ message: 'Senha redefinida com sucesso!' });
        } catch (error) {
            console.error('Erro na verificação do token:', error);
            return res.status(400).json({ message: 'Token inválido ou expirado.' });
        }
    }

    // ✅ NOVA AÇÃO: LOGIN
    if (action === 'login') {
        try {
            console.log('Tentativa de login com:', { username });

            const { data: user, error } = await supabase
                .from('empresas')
                .select('uuid, email, destinataria, senha, empresaPai_uuid')
                .eq('email', username)
                .single();

            console.log('Resultado da consulta ao Supabase:', { user, error });

            if (error || !user) {
                console.error('Usuário ou senha incorretos', { error });
                return res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.senha);

            if (!isPasswordValid) {
                console.error('Senha incorreta');
                return res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
            }

            const jwtToken = jwt.sign(
                {
                    userId: user.uuid,
                    email: user.email,
                    destinataria: user.destinataria,
                    empresaPai: user.empresaPai_uuid,
                },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            console.log('Token JWT gerado:', jwtToken);

            return res.status(200).json({
                success: true,
                token: jwtToken,
                message: 'Autenticação bem-sucedida',
                uuid: user.uuid,
                destinataria: user.destinataria,
                empresaPai_uuid: user.empresaPai_uuid,
            });
        } catch (error) {
            console.error('Erro ao processar a autenticação:', error.message);
            return res.status(500).json({ success: false, message: 'Erro ao autenticar', error: error.message });
        }
    }

    // Se nenhuma ação válida for fornecida
    return res.status(400).json({ message: 'Ação desconhecida' });
}
