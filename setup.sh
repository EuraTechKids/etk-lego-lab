#!/bin/sh
# Télécharge les ressources (non versionnées) dans ./ressources
mkdir -p ressources && cd ressources
[ -d ldraw ] || git clone --depth 1 https://github.com/pybricks/ldraw.git
[ -d LDCadShadowLibrary ] || git clone --depth 1 https://github.com/RolandMelkert/LDCadShadowLibrary.git
