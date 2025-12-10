import { redirect } from 'next/navigation';

export const metadata = {
  title: 'TechDengue Dashboard',
  description: 'Acesso direto ao dashboard operacional TechDengue',
};

export default function LoginPage() {
  redirect('/dashboard');
}
