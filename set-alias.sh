#!/bin/bash

# Set alias hanya untuk session terminal saat ini
alias sail='sh $([ -f sail ] && echo sail || echo vendor/bin/sail)'
echo "✓ Alias sail berhasil diaktifkan untuk session ini"