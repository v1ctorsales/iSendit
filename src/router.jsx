import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext'; // Importa o contexto de autenticação
import Form from "./components/Form";
import FormRegraFW from "./components/FormRegraFW";
import FormConfigurar from "./components/FormConfiguracoes";
import PageLogin from "./components/PageLogin";
import PageSeeAllTasks from "./components/PageSeeAllTasks";
import PageAjuda from "./components/PageAjuda";
import PageSeeAllTasksRecebidas from "./components/PageSeeAllTasksRecebidas";
import ResetPassword from "./components/ResetPassword"
import PagePlano from './components/PagePlano';

function LoginPage() {
    return <PageLogin />
}

function FirewallPage() {
    return <FormRegraFW />
}

function ObjetosPage() {
    return <Form />;
}

function EnviosPage() {
    const { destinataria } = useContext(AuthContext); // Obtém o valor de destinataria do contexto

    // Se destinataria for false, retorna PageSeeAllTasks, caso contrário, PageSeeAllTasksRecebidas
    return destinataria ? <PageSeeAllTasksRecebidas /> : <PageSeeAllTasks />;
}

function ConfiguracoesPage() {
    return <FormConfigurar />
}

function AjudaPage() {
    return <PageAjuda />
}

function ResetPW(){
    return <ResetPassword />
}

function SignUp(){
    return <PagePlano />
}

export {
    LoginPage,
    FirewallPage,
    ObjetosPage,
    EnviosPage,
    ConfiguracoesPage,
    AjudaPage,
    ResetPW,
    SignUp
};
