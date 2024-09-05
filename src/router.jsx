import Form from "./components/Form";
import FormRegraFW from "./components/FormRegraFW";
import FormConfigurar from "./components/FormConfiguracoes";
import PageLogin from "./components/PageLogin";
import PageSeeAllTasks from "./components/PageSeeAllTasks";
import PageAjuda from "./components/PageAjuda";

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
    return <PageSeeAllTasks />
}

function ConfiguracoesPage() {
    return <FormConfigurar />
}

function AjudaPage() {
    return <PageAjuda />
}

export {
    LoginPage,
    FirewallPage,
    ObjetosPage,
    EnviosPage,
    ConfiguracoesPage,
    AjudaPage
};
