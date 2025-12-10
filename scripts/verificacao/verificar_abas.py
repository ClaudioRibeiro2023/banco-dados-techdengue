import pandas as pd

excel_file = pd.ExcelFile(r'base_dados\dados_techdengue\Atividades Techdengue.xlsx')
print('Abas disponíveis no arquivo:')
for sheet in excel_file.sheet_names:
    print(f'  - "{sheet}"')
