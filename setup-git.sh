#!/bin/bash

# Script para inicializar git y hacer push inicial

echo "🚀 Configurando Git para producción..."

# Inicializar git
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit - Job board ready for production"

echo "✅ Git inicializado y commit creado"
echo ""
echo "📝 Próximos pasos:"
echo "1. Crea un repositorio en GitHub (https://github.com/new)"
echo "2. Ejecuta estos comandos (reemplaza con tu repo):"
echo "   git remote add origin https://github.com/tu-usuario/tu-repo.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Luego sigue las instrucciones en PROD_SETUP.md para desplegar en Railway"

