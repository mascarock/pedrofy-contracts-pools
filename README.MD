# TON DEX - Protocolo de Intercambio Descentralizado en TON

Este proyecto implementa un protocolo de intercambio descentralizado (DEX) en la blockchain TON, inspirado en el modelo AMM (Automated Market Maker) similar a Uniswap. El sistema permite crear pares de intercambio de tokens, agregar/quitar liquidez, y realizar operaciones de swap entre tokens.

## Estructura del Proyecto

El proyecto consta de dos contratos principales escritos en FunC y sus correspondientes wrappers en TypeScript:

1. **Factory Contract**: Gestiona la creación de pares de intercambio.
2. **Pair Contract**: Implementa la lógica de liquidez y swap para cada par de tokens.

## Arquitectura

### Factory Contract

El contrato Factory es el punto central del protocolo, responsable de:

- Crear nuevos pares de intercambio (cada par es una instancia del contrato Pair)
- Mantener un registro de todos los pares existentes
- Gestionar la configuración global como las comisiones predeterminadas
- Administrar la recolección de comisiones

### Pair Contract

Cada contrato Pair representa un par de intercambio entre dos tokens específicos y maneja:

- Agregar liquidez al pool
- Remover liquidez del pool
- Operaciones de swap entre los dos tokens
- Transferencia de tokens LP (Liquidity Provider)
- Cálculo automático de precios basado en la fórmula x * y = k

## Comunicación entre contratos

1. El Factory Contract despliega nuevos contratos Pair con sus respectivas configuraciones iniciales.
2. El Factory mantiene un registro de direcciones de todos los pares creados.
3. Los contratos Pair contienen una referencia a su Factory, permitiendo la comunicación bidireccional.
4. El Factory puede recolectar comisiones acumuladas por los contratos Pair.

## Instalación y Uso

### Requisitos previos

- Node.js (v16 o superior)
- Yarn

### Instalación

```bash
yarn install
```

### Compilación

Para compilar los contratos:

```bash
yarn build
```

### Despliegue

#### Desplegar Factory Contract

```bash
yarn deploy
```

Sigue las instrucciones en la terminal para configurar:
- Seleccionar deployFactoryContract o deployPairContract
- seleccionar red tesnet o mainnet
- Seleccionar Billetera Toonkeeper conectar billetera
- Seguir instrucciones despues de haber desplegado habra un link directo hacia el contrato

### Resolución de problemas

Si encuentras el error al crear un par, verifica:

1. Que las direcciones de los tokens estén en el formato correcto
2. Que los tokens sean diferentes entre sí
3. Que tengas suficiente TON para la operación (al menos 0.3 TON)
4. Que el par no exista ya en el Factory

## Operaciones

### Factory Contract

- **createPair**: Crea un nuevo par de intercambio (opcode: 0x12a2d48c)
- **setFee**: Configura la comisión predeterminada (opcode: 0x637f0d2b)
- **collectFee**: Recolecta comisiones acumuladas (opcode: 0x5dbd0308)

### Pair Contract

- **addLiquidity**: Añade liquidez al pool (opcode: 0x234c7bef)
- **removeLiquidity**: Remove liquidez del pool (opcode: 0x5edc1170)
- **swap**: Intercambia tokens (opcode: 0x107c51ee)
- **transfer**: Transfiere tokens LP (opcode: 0x7362d09c)

## Información técnica

### Variables del Factory

- **ctx_owner**: Dirección del propietario del factory
- **ctx_pairs**: Diccionario de pares (token0, token1) -> dirección_par
- **ctx_pair_code**: Código del contrato para pares
- **ctx_default_fee**: Comisión predeterminada para nuevos pares
- **ctx_fee_collector**: Dirección para recolectar comisiones
- **ctx_total_pairs**: Contador de pares creados

### Variables del Pair

- **ctx_token0_address, ctx_token1_address**: Direcciones de los tokens
- **ctx_reserve0, ctx_reserve1**: Reservas de tokens
- **ctx_total_supply**: Suministro total de tokens LP
- **ctx_lp_balances**: Balances de tokens LP por dirección
- **ctx_fee**: Comisión del par
- **ctx_factory_address**: Dirección del factory

## Wrappers

Los wrappers en TypeScript proporcionan una interfaz sencilla para interactuar con los contratos:

- **LiquidityPool**: Wrapper para el Factory Contract
- **PairContract**: Wrapper para el Pair Contract

Estos wrappers facilitan la integración del DEX con aplicaciones frontend o servicios.

## Fórmulas clave

- **Swap**: Usa la fórmula de producto constante donde `x * y = k`
- **Comisión**: Se aplica un porcentaje (en basis points) a cada operación
- **LP Tokens**: Para la primera adición de liquidez, `LP = sqrt(amount0 * amount1)`



# Script de Creación de Pares - TON DEX

Este documento explica el funcionamiento del script `createPair.ts`, que se utiliza para crear nuevos pares de liquidez en el protocolo TON DEX.

## Descripción

El script `createPair.ts` es una herramienta para interactuar con el Factory Contract y crear nuevos pares de intercambio (Pair Contracts) para dos tokens especificados. **Actualmente, este script presenta problemas al intentar crear pares.**

## Funcionamiento

El script sigue los siguientes pasos:

1. **Conexión al Factory Contract**: Utiliza la dirección proporcionada para conectarse al Factory Contract desplegado.
2. **Verificación de tokens**: Solicita las direcciones de los dos tokens que formarán el par de intercambio.
3. **Comprobación de existencia**: Verifica si el par ya existe para evitar duplicados.
4. **Creación del par**: Envía una transacción al Factory Contract para crear un nuevo par.
5. **Polling de confirmación**: Espera y verifica repetidamente hasta confirmar que el par ha sido creado.
6. **Información final**: Muestra detalles sobre el par creado y estadísticas del Factory.

## Uso

```bash
yarn deploy seleccionar archivo  createpair.ts
```
- seguir instrucciones 
- introducir direccion del contrato FactoryContract
- introducir direccion token0 y token1


## Problemas Conocidos

🚨 **Este script actualmente está fallando al intentar crear pares.** 🚨

