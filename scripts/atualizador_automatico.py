"""
Sistema de Atualização Automática
Sincroniza dados do servidor PostgreSQL e atualiza toda a base de dados
"""
import sys
import logging
from pathlib import Path
from datetime import datetime
import json
import time

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/atualizador_automatico.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Importar módulos do sistema
from src.sync import DataSynchronizer
from src.config import Config

BASE_DIR = Path(__file__).parent
METADATA_DIR = BASE_DIR / "data_lake" / "metadata"

class AtualizadorAutomatico:
    """
    Sistema de atualização automática da base de dados
    
    Features:
    - Sincroniza dados do servidor PostgreSQL
    - Executa pipeline ETL completo
    - Valida qualidade dos dados
    - Registra histórico de atualizações
    - Detecta mudanças (Change Data Capture)
    """
    
    def __init__(self):
        self.sync = DataSynchronizer()
        self.historico_file = METADATA_DIR / 'historico_atualizacoes.json'
        self.historico = self._carregar_historico()
        
    def _carregar_historico(self):
        """Carrega histórico de atualizações"""
        if self.historico_file.exists():
            with open(self.historico_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {'atualizacoes': []}
    
    def _salvar_historico(self):
        """Salva histórico de atualizações"""
        with open(self.historico_file, 'w', encoding='utf-8') as f:
            json.dump(self.historico, f, indent=2, default=str)
    
    def verificar_mudancas(self):
        """
        Verifica se houve mudanças no servidor
        
        Returns:
            bool: True se houve mudanças
        """
        logger.info("Verificando mudanças no servidor...")
        
        # Obter status atual
        status_atual = self.sync.get_sync_status()
        
        # Se não há sincronização anterior, há mudanças
        if not status_atual:
            logger.info("Primeira sincronização - considerando como mudança")
            return True
        
        # Verificar idade do cache
        for table, info in status_atual.items():
            if not info['is_fresh']:
                logger.info(f"Cache de {table} desatualizado - há mudanças")
                return True
        
        logger.info("Cache ainda válido - sem mudanças")
        return False
    
    def executar_atualizacao_completa(self, force=False):
        """
        Executa atualização completa da base de dados
        
        Args:
            force: Força atualização mesmo sem mudanças
            
        Returns:
            dict: Resultado da atualização
        """
        inicio = datetime.now()
        
        logger.info("="*80)
        logger.info("🔄 INICIANDO ATUALIZAÇÃO AUTOMÁTICA")
        logger.info("="*80)
        logger.info(f"Data/Hora: {inicio.strftime('%d/%m/%Y %H:%M:%S')}")
        logger.info(f"Modo: {'FORÇADO' if force else 'AUTOMÁTICO'}")
        
        resultado = {
            'inicio': inicio.isoformat(),
            'force': force,
            'etapas': {},
            'sucesso': False,
            'erro': None
        }
        
        try:
            # 1. Verificar mudanças
            if not force:
                tem_mudancas = self.verificar_mudancas()
                if not tem_mudancas:
                    logger.info("✅ Sem mudanças detectadas - atualização não necessária")
                    resultado['sucesso'] = True
                    resultado['motivo'] = 'sem_mudancas'
                    return resultado
            
            # 2. Sincronizar dados do servidor
            logger.info("\n1️⃣ Sincronizando dados do servidor PostgreSQL...")
            sync_result = self.sync.sync_all(force=True)
            resultado['etapas']['sincronizacao'] = sync_result
            
            # Verificar se sincronização foi bem-sucedida
            sync_ok = all(r['status'] != 'error' for r in sync_result.values())
            if not sync_ok:
                raise Exception("Erro na sincronização de dados")
            
            logger.info("✅ Sincronização concluída")
            
            # 3. Executar pipeline ETL
            logger.info("\n2️⃣ Executando pipeline ETL...")
            import subprocess
            
            etl_result = subprocess.run(
                [sys.executable, 'pipeline_etl_completo.py'],
                capture_output=True,
                text=True,
                cwd=BASE_DIR
            )
            
            if etl_result.returncode != 0:
                raise Exception(f"Erro no pipeline ETL: {etl_result.stderr}")
            
            resultado['etapas']['pipeline_etl'] = {
                'status': 'success',
                'returncode': etl_result.returncode
            }
            
            logger.info("✅ Pipeline ETL concluído")
            
            # 4. Criar MEGA TABELA
            logger.info("\n3️⃣ Criando MEGA TABELA...")
            
            mega_result = subprocess.run(
                [sys.executable, 'criar_mega_tabela.py'],
                capture_output=True,
                text=True,
                cwd=BASE_DIR
            )
            
            if mega_result.returncode != 0:
                raise Exception(f"Erro ao criar MEGA TABELA: {mega_result.stderr}")
            
            resultado['etapas']['mega_tabela'] = {
                'status': 'success',
                'returncode': mega_result.returncode
            }
            
            logger.info("✅ MEGA TABELA criada")
            
            # 5. Validar qualidade
            logger.info("\n4️⃣ Validando qualidade dos dados...")
            
            validacao_result = subprocess.run(
                [sys.executable, 'validacao_cruzada_qualidade.py'],
                capture_output=True,
                text=True,
                cwd=BASE_DIR
            )
            
            if validacao_result.returncode != 0:
                logger.warning("Validação retornou avisos, mas continuando...")
            
            # Carregar relatório de qualidade
            relatorio_path = METADATA_DIR / 'relatorio_qualidade_completo.json'
            if relatorio_path.exists():
                with open(relatorio_path, 'r', encoding='utf-8') as f:
                    relatorio_qualidade = json.load(f)
                    resultado['etapas']['validacao'] = relatorio_qualidade
                    
                    score = relatorio_qualidade.get('score_qualidade_geral', 0)
                    logger.info(f"✅ Validação concluída - Score: {score}%")
            
            # Sucesso!
            resultado['sucesso'] = True
            
            fim = datetime.now()
            duracao = (fim - inicio).total_seconds()
            
            resultado['fim'] = fim.isoformat()
            resultado['duracao_segundos'] = duracao
            
            logger.info("\n" + "="*80)
            logger.info("✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO")
            logger.info("="*80)
            logger.info(f"Duração: {duracao:.2f} segundos")
            
        except Exception as e:
            logger.error(f"\n❌ ERRO NA ATUALIZAÇÃO: {e}")
            resultado['sucesso'] = False
            resultado['erro'] = str(e)
            
            fim = datetime.now()
            resultado['fim'] = fim.isoformat()
        
        # Registrar no histórico
        self.historico['atualizacoes'].append(resultado)
        self._salvar_historico()
        
        return resultado
    
    def executar_loop_continuo(self, intervalo_minutos=60):
        """
        Executa atualizações em loop contínuo
        
        Args:
            intervalo_minutos: Intervalo entre atualizações
        """
        logger.info("="*80)
        logger.info("🔄 MODO CONTÍNUO ATIVADO")
        logger.info("="*80)
        logger.info(f"Intervalo: {intervalo_minutos} minutos")
        logger.info("Pressione Ctrl+C para parar")
        logger.info("="*80)
        
        try:
            while True:
                # Executar atualização
                self.executar_atualizacao_completa(force=False)
                
                # Aguardar intervalo
                logger.info(f"\n⏰ Próxima atualização em {intervalo_minutos} minutos...")
                time.sleep(intervalo_minutos * 60)
                
        except KeyboardInterrupt:
            logger.info("\n\n⚠️  Modo contínuo interrompido pelo usuário")
        except Exception as e:
            logger.error(f"\n❌ Erro no modo contínuo: {e}")


def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Sistema de Atualização Automática - TechDengue'
    )
    
    parser.add_argument(
        '--force',
        action='store_true',
        help='Força atualização mesmo sem mudanças'
    )
    
    parser.add_argument(
        '--continuo',
        action='store_true',
        help='Executa em modo contínuo'
    )
    
    parser.add_argument(
        '--intervalo',
        type=int,
        default=60,
        help='Intervalo entre atualizações em minutos (padrão: 60)'
    )
    
    args = parser.parse_args()
    
    # Criar diretório de logs
    logs_dir = Path('logs')
    logs_dir.mkdir(exist_ok=True)
    
    # Criar atualizador
    atualizador = AtualizadorAutomatico()
    
    if args.continuo:
        # Modo contínuo
        atualizador.executar_loop_continuo(intervalo_minutos=args.intervalo)
    else:
        # Execução única
        resultado = atualizador.executar_atualizacao_completa(force=args.force)
        
        # Retornar código de saída
        return 0 if resultado['sucesso'] else 1


if __name__ == '__main__':
    sys.exit(main())
