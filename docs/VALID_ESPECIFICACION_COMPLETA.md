# VALID PLATFORM - ESPECIFICACIÓN COMPLETA

## 📋 TABLA DE CONTENIDOS

1. Arquitectura General
2. Arquitectura BD
3. Flujo: Ariel (Server-Side)
4. Validación A.1: Documentos válidos
5. Validación A.2: Cumplimiento Protocolo
6. Validación B.1: Inferencia de tipo (ERD/EAU)
7. Validación B.2: Empleado en condiciones
8. Flujo N8N Completo
9. Reporte Final

---

## 1. ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                         VALID PLATFORM                           │
└─────────────────────────────────────────────────────────────────┘

CLIENTE (evento):
  ├─ Crea evento con working_dates (pre_prod, prod, post_prod)
  ├─ Sube PDFs corporativos (ART, AP, CNR, SVO, F931, CAT, etc)
  └─ Sube Excel con empleados del evento

ARIEL (Server-Side):
  ├─ Extrae datos de PDFs con OCR/Claude Vision
  ├─ Normaliza campos (CUIL, DNI, fechas, nombres)
  ├─ Consulta ARCA API (tipo empleado, autonomía, verificaciones)
  ├─ Guarda en BD (Supabase): tablas relacionales + JSON
  └─ Listos para que N8N los consuma

BD (Supabase):
  ├─ submissions (documento completo + JSON)
  ├─ submission_documents (ART, AP, CNR, etc)
  ├─ submission_employees (empleados en documentos)
  ├─ event_employees (empleados del evento)
  ├─ validation_results (resultados matching)
  └─ validation_reports (reportes finales)

N8N (Validaciones):
  ├─ A.1: ¿Documentos técnicamente válidos?
  ├─ A.2: ¿Cumplen protocolo del evento?
  ├─ B.1: ¿Qué tipo de empleado? (ERD/EAU)
  ├─ B.2: ¿Está en condiciones de ingresar?
  └─ Reportes finales

DASHBOARD:
  ├─ Ver validaciones A.1, A.2
  ├─ Ver validaciones B.1, B.2
  ├─ Descargar reportes
  └─ Revisar empleados rechazados
```

---

## 2. ARQUITECTURA BD

### Tablas Supabase

```sql
-- SUBMISIONES
CREATE TABLE submissions (
  submission_id UUID PRIMARY KEY,
  event_id UUID NOT NULL,
  event_name TEXT,
  event_date DATE,
  working_dates JSONB,  -- {pre_production_start, production_date, post_production_end}

  -- JSON COMPLETO (desnormalizado)
  data JSONB NOT NULL,  -- {documents_a, documents_b}

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- DOCUMENTOS CORPORATIVOS
CREATE TABLE submission_documents (
  document_id UUID PRIMARY KEY,
  submission_id UUID NOT NULL,
  type VARCHAR(50),  -- ART, AP, CNR, SVO, F931, CAT, CONSTANCIA_ARCA
  confidence FLOAT,

  -- INSURER INFO
  insurer_type VARCHAR(50),
  insurer_name VARCHAR(255),
  insurer_cuit VARCHAR(20),
  policy_number VARCHAR(100),

  -- VIGENCIA
  validity_from DATE,
  validity_to DATE,
  is_valid_at_event_date BOOLEAN,

  -- JSON COMPLETO
  extracted_data JSONB,  -- {insurer_info, employees[]}

  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (submission_id) REFERENCES submissions(submission_id)
);

-- EMPLEADOS EN DOCUMENTOS
CREATE TABLE submission_employees (
  employee_doc_id UUID PRIMARY KEY,
  document_id UUID NOT NULL,
  submission_id UUID NOT NULL,

  cuil_plain VARCHAR(11),
  cuil_formatted VARCHAR(13),
  dni VARCHAR(10),

  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name_normalized VARCHAR(255),

  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (document_id) REFERENCES submission_documents(document_id),
  FOREIGN KEY (submission_id) REFERENCES submissions(submission_id)
);

-- EMPLEADOS DEL EVENTO
CREATE TABLE event_employees (
  event_employee_id UUID PRIMARY KEY,
  submission_id UUID NOT NULL,
  event_id UUID NOT NULL,

  cuil_plain VARCHAR(11),
  cuil_formatted VARCHAR(13),
  dni VARCHAR(10),

  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name_normalized VARCHAR(255),

  role VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (submission_id) REFERENCES submissions(submission_id)
);

-- RESULTADOS VALIDACIÓN
CREATE TABLE validation_results (
  result_id UUID PRIMARY KEY,
  submission_id UUID NOT NULL,
  event_employee_id UUID NOT NULL,

  has_coverage BOOLEAN,
  coverage_status VARCHAR(50),  -- COVERED, MISSING

  matching_method VARCHAR(100),
  confidence FLOAT,

  matched_documents JSONB,

  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (submission_id) REFERENCES submissions(submission_id),
  FOREIGN KEY (event_employee_id) REFERENCES event_employees(event_employee_id)
);

-- REPORTES FINALES
CREATE TABLE validation_reports (
  report_id UUID PRIMARY KEY,
  submission_id UUID NOT NULL UNIQUE,

  total_employees INT,
  employees_covered INT,
  employees_missing INT,
  coverage_percentage FLOAT,
  overall_status VARCHAR(50),  -- COMPLETE, INCOMPLETE

  report_data JSONB,  -- Reporte completo

  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (submission_id) REFERENCES submissions(submission_id)
);
```

---

## 3. FLUJO: ARIEL (Server-Side)

### Proceso de Ariel

```
1. CLIENTE SUBE DOCUMENTOS
   ├─ PDFs corporativos (ART, AP, CNR, SVO, F931, CAT, CONSTANCIA)
   └─ Excel con empleados evento

2. ARIEL EXTRAE
   ├─ PDF → OCR/Claude Vision API
   ├─ Parse datos estructurados
   ├─ Normaliza:
   │  ├─ CUIL: formato XX-XXXXXXXX-X (y sin guiones)
   │  ├─ DNI: sin puntos (8 dígitos)
   │  ├─ Nombres: UPPERCASE, sin tildes
   │  ├─ Razón social: UPPERCASE
   │  └─ Fechas: YYYY-MM-DD
   └─ Consulta ARCA API (si es necesario)

3. ARIEL CONSULTA ARCA (cuando sea necesario)
   ├─ CONSTANCIA ARCA: verificar autenticidad
   ├─ Empleado: inferir tipo (ERD/EAU)
   └─ Autonomía: verificar datos

4. ARIEL GUARDA EN BD
   ├─ INSERT submissions (JSON con documents_a, documents_b)
   ├─ INSERT submission_documents (cada ART, AP, etc)
   ├─ INSERT submission_employees (empleados de cada doc)
   ├─ INSERT event_employees (empleados del Excel)
   └─ TODO normalizado y validado técnicamente

5. READY PARA N8N
   └─ N8N consulta: SELECT * FROM submissions WHERE submission_id = ?
```

### Estructura JSON que Ariel guarda

```json
{
  "submission_id": "sub_2026_02_001",
  "event_id": "evt_1001",
  "event_name": "LA VELA PUERCA",
  "event_date": "2026-02-28",
  "working_dates": {
    "pre_production_start": "2026-02-25",
    "production_date": "2026-02-28",
    "post_production_end": "2026-03-01"
  },

  "documents_a": [
    {
      "document_id": "doc_art_sullair_20260229",
      "type": "ART",
      "confidence": 0.95,

      "extracted_data": {
        "insurer_info": {
          "insurer_type": "ART",
          "insurer_name": "EXPERTA ART S.A.",
          "insurer_cuit": "30-75672171-0",
          "policy_number": "471427",
          "validity_period": {
            "from": "2007-04-01",
            "to": "2019-03-31"
          },
          "is_valid_at_event_date": false
        },

        "employees": [
          {
            "cuil_plain": "20408951853",
            "cuil_formatted": "20-40895185-3",
            "dni": "20408951853",
            "first_name": "AXEL",
            "last_name": "ABALOS",
            "full_name_normalized": "ABALOS AXEL"
          }
        ]
      }
    }
  ],

  "documents_b": {
    "document_id": "doc_event_employees_evt_1001",
    "type": "EXCEL_EVENT_EMPLOYEES",
    "confidence": 0.99,

    "extracted_data": {
      "employees": [
        {
          "emp_id": "emp_b_001",
          "cuil_plain": "20408951853",
          "cuil_formatted": "20-40895185-3",
          "dni": "20408951853",
          "first_name": "AXEL",
          "last_name": "ABALOS",
          "full_name_normalized": "ABALOS AXEL",
          "role": "Técnico"
        }
      ]
    }
  }
}
```

---

## 4. VALIDACIÓN A.1 - DOCUMENTOS VÁLIDOS

### ¿Qué valida?

Asume: Ariel ya extrajo y guardó en BD

Verifica que cada documento sea **técnicamente válido**:

- ¿PDF/Excel es legible?
- ¿OCR tuvo confianza >85%?
- ¿Campos obligatorios están presentes?
- ¿Datos están normalizados?
- ¿Es auténtico (no falsificado)?

### Status posibles

```
✅ VALID       - Documento íntegro, todos OK
⚠️  PARTIAL    - Algunas inconsistencias menores pero usable
❌ INVALID    - Falta algo crítico, no usable
```

### Pseudocódigo

```javascript
const validateDocumentTechnical = (doc) => {
  const validation = {
    document_id: doc.document_id,
    type: doc.type,
    checks: {},
    errors: [],
    warnings: []
  };

  // CHECK 1: Confianza OCR
  if (doc.confidence < 0.85) {
    validation.warnings.push("Baja confianza OCR");
    validation.checks.confidence = "WARNING";
  } else {
    validation.checks.confidence = "OK";
  }

  // CHECK 2: Campos obligatorios
  const required = getRequiredFieldsByType(doc.type);
  required.forEach(field => {
    if (!doc.extracted_data[field]) {
      validation.errors.push(`Campo faltante: ${field}`);
    }
  });

  // CHECK 3: Normalización (formato, UPPERCASE, etc)
  if (!isValidCUIL(doc.cuil_plain)) {
    validation.errors.push("CUIL mal formateado");
  }
  if (!isValidDNI(doc.dni)) {
    validation.errors.push("DNI mal formateado");
  }

  // CHECK 4: Autenticidad (si CONSTANCIA ARCA)
  if (doc.type === "CONSTANCIA_ARCA") {
    const arca_result = await verifyARCAConstancia(doc.data);
    if (!arca_result.is_authentic) {
      validation.errors.push("CONSTANCIA no se verifica en ARCA");
    }
  }

  // RESULTADO
  const has_errors = validation.errors.length > 0;
  const has_warnings = validation.warnings.length > 0;

  validation.status =
    has_errors ? "INVALID" :
    has_warnings ? "PARTIAL" :
    "VALID";

  return validation;
};
```

---

## 5. VALIDACIÓN A.2 - CUMPLIMIENTO PROTOCOLO

### ¿Qué valida?

Asume: Todos documentos VALID o PARTIAL (de A.1)

Verifica que cumplan **requisitos del protocolo del evento**:

- ¿Documentos obligatorios están presentes?
- ¿Relaciones entre documentos se cumplen (ART→CNR→SVO)?
- ¿Vigencias son correctas?
- ¿Datos coinciden entre documentos?

### Status posibles

```
✅ CUMPLE      - Protocolo satisfecho completamente
⚠️  INCOMPLETO  - Falta algo menor, pero procede
❌ INCUMPLE    - Protocolo NO satisfecho, STOP
```

### Por tipo de documento

#### [ART]

```
✅ Existe (obligatorio)
✅ Vigencia cubre evento (pre_prod → post_prod)
✅ Tiene mínimo X días antes evento (según protocolo)
✅ Tiene CNR obligatorio
✅ Tiene SVO obligatorio
```

#### [AP]

```
✅ Existe (obligatorio)
✅ Cubre rango: 1 día antes - 1 día después evento
✅ Emisión: no más de X días antiguo (protocolo define)
✅ Requisitos específicos del protocolo
```

#### [CNR]

```
✅ Póliza coincide con ART
✅ CUIT coincide con ART
✅ Razón social coincide con ART
(Si no coinciden: FLAG para manual review)
```

#### [SVO]

```
✅ Existe (obligatorio si existe ART)
✅ Vigencia cubre evento
✅ Tiene lista nominal de empleados
```

#### [CAT]

```
✅ Vigencia cubre evento (si existe)
```

#### [F931]

```
✅ Vigencia cubre evento (si existe)
```

#### [CONSTANCIA_ARCA]

```
✅ Validez actual
✅ Se verifica en ARCA API
```

### Pseudocódigo

```javascript
const validateProtocolCompliance = (submission, event, protocol) => {
  const validation = {
    event_id: event.event_id,
    protocol_id: protocol.protocol_id,
    checks: {},
    errors: [],
    warnings: [],
    compliance: true,
  }

  // Verificar documentos obligatorios
  protocol.required_documents.forEach(req_doc => {
    if (req_doc.mandatory === true) {
      const doc = submission.documents_a.find(d => d.type === req_doc.type)

      if (!doc) {
        validation.errors.push(`Documento obligatorio faltante: ${req_doc.type}`)
        validation.compliance = false
        return
      }

      // Validar requisitos específicos
      if (req_doc.type === 'ART') {
        if (!doc.is_valid_at_event_date) {
          validation.errors.push('ART no cubre evento')
          validation.compliance = false
        }
        const cnr_exists = submission.documents_a.some(d => d.type === 'CNR')
        if (!cnr_exists) {
          validation.errors.push('ART requiere CNR obligatorio')
          validation.compliance = false
        }
        const svo_exists = submission.documents_a.some(d => d.type === 'SVO')
        if (!svo_exists) {
          validation.errors.push('ART requiere SVO obligatorio')
          validation.compliance = false
        }
      }

      if (req_doc.type === 'AP') {
        const required_from = addDays(event.pre_production_start, -1)
        const required_to = addDays(event.post_production_end, 1)
        if (doc.validity_from > required_from || doc.validity_to < required_to) {
          validation.errors.push('AP no cubre rango completo')
          validation.compliance = false
        }
      }
    }
  })

  // Verificar relaciones
  const art = submission.documents_a.find(d => d.type === 'ART')
  const cnr = submission.documents_a.find(d => d.type === 'CNR')

  if (art && cnr) {
    if (art.insurer_cuit !== cnr.insurer_cuit) {
      validation.warnings.push('CUIT CNR != CUIT ART')
    }
  }

  validation.status = !validation.compliance
    ? 'INCUMPLE'
    : validation.warnings.length > 0
      ? 'INCOMPLETO'
      : 'CUMPLE'

  return validation
}
```

---

## 6. VALIDACIÓN B.1 - INFERENCIA DE TIPO (ERD/EAU)

### ¿Qué valida?

Para cada empleado del Excel, determinar: **¿Es ERD o EAU?**

Sin este dato, no podemos saber qué requisitos aplicar en B.2.

### Métodos (en orden)

```
1. ¿Aparece en ART (documentos A)?
   → ERD (empleado dependencia)

2. ¿Aparece en CONSTANCIA ARCA (documentos A)?
   → EAU (trabajador autónomo)

3. Consultar ARCA API (por CUIL/DNI)
   → ERD o EAU según ARCA

4. Si nada funciona
   → UNKNOWN (requiere revisión manual)
```

### Status posibles

```
✅ ERD (confidence: 0.85-0.95)
✅ EAU (confidence: 0.85-0.95)
❓ UNKNOWN → REJECTED automático
```

### Pseudocódigo

```javascript
const inferEmployeeType = async (employee, submission) => {
  // Método 1: ¿En ART?
  const in_art = submission.documents_a
    .filter(d => d.type === 'ART')
    .some(art =>
      art.extracted_data.employees.some(
        e => e.cuil_plain === employee.cuil_plain || e.dni === employee.dni
      )
    )

  if (in_art) {
    return {
      type: 'ERD',
      confidence: 0.95,
      method: 'FOUND_IN_ART',
    }
  }

  // Método 2: ¿En CONSTANCIA?
  const in_constancia = submission.documents_a
    .filter(d => d.type === 'CONSTANCIA_ARCA')
    .some(c => c.employee_cuil === employee.cuil_plain)

  if (in_constancia) {
    return {
      type: 'EAU',
      confidence: 0.95,
      method: 'FOUND_IN_CONSTANCIA',
    }
  }

  // Método 3: Consultar ARCA
  try {
    const arca = await queryARCA(employee.cuil_plain)

    if (arca.employment_type === 'ERD') {
      return {
        type: 'ERD',
        confidence: 0.85,
        method: 'ARCA_API_ERD',
      }
    } else if (arca.employment_type === 'EAU' || arca.employment_type === 'MONOTRIBUTO') {
      return {
        type: 'EAU',
        confidence: 0.85,
        method: 'ARCA_API_EAU',
      }
    }
  } catch (error) {
    // ARCA no responde
  }

  // Método 4: No se puede inferir
  return {
    type: 'UNKNOWN',
    confidence: 0,
    method: 'UNABLE_TO_INFER',
  }
}
```

---

## 7. VALIDACIÓN B.2 - EMPLEADO EN CONDICIONES

### ¿Qué valida?

Asume: Tipo de empleado ya fue inferido (B.1)

Verifica: **¿El empleado está en condiciones de ingresar?**

Compara: Excel (empleado evento) vs Documentos (ART, SVO, F931, AP, CONSTANCIA)

---

### SI ES ERD (EMPLEADO RELACIÓN DE DEPENDENCIA)

#### REQUISITO 1: Estar en nómina ART vigente

```
¿El empleado aparece en ART.employees?
  └─ Query: employee.cuil_plain o employee.dni IN ART.employees

Y ¿ART es vigente en el rango de trabajo?
  └─ ART.validity_from ≤ event.pre_production_start
  └─ ART.validity_to ≥ event.post_production_end

Resultado:
  ✅ OK - Aparece en ART vigente
  ❌ FALTA - No aparece o ART vencido
     Acción: Subir ART que incluya al empleado
```

#### REQUISITO 2: Tener CAT O estar activo en ARCA

```
¿El empleado aparece en CAT vigente?
  └─ Query: employee.cuil_plain o employee.dni IN CAT.employees
  └─ Y CAT.validity_from ≤ event.production_date ≤ CAT.validity_to

Si NO:
  └─ Consultar ARCA API:
     └─ ¿El empleador lo tiene como empleado activo?

Resultado:
  ✅ OK - Tiene CAT O está activo en ARCA
  ❌ FALTA - No tiene CAT ni está activo
     Acción: Subir CAT vigente O verificar ARCA
```

#### REQUISITO 3: Tener SVO O F931 vigente

```
¿El empleado aparece en SVO vigente?
  └─ Query: employee.cuil_plain o employee.dni IN SVO.employees
  └─ Y SVO.validity_from ≤ event.production_date ≤ SVO.validity_to

Si NO:
  └─ ¿Aparece en F931 vigente?
     └─ Query: employee.cuil_plain o employee.dni IN F931.employees
     └─ Y F931.validity_from ≤ event.production_date ≤ F931.validity_to

Resultado:
  ✅ OK - Tiene SVO O F931 vigente
  ❌ FALTA - No tiene SVO ni F931
     Acción: Subir SVO vigente O F931 vigente
```

#### RESULTADO ERD

```
¿TODOS los 3 requisitos son OK?
  SÍ  → ✅ APPROVED (puede ingresar)
  NO  → ❌ REJECTED (no puede ingresar)
        + listado de acciones para resolver
```

---

### SI ES EAU (TRABAJADOR AUTÓNOMO)

#### REQUISITO 1: Tener Constancia ARCA vigente

```
¿El empleado tiene Constancia de inscripción AFIP vigente?
  └─ Query: employee.cuil_plain IN CONSTANCIA_ARCA.employees
  └─ Y CONSTANCIA.validity_to ≥ event.production_date

Si NO:
  └─ Consultar ARCA API:
     └─ ¿Es autónomo activo en ARCA?
     └─ ¿Es monotributista?
     └─ ¿Tiene régimen de autónomo?

Resultado:
  ✅ OK - Tiene CONSTANCIA vigente O está activo en ARCA
  ❌ FALTA - No tiene CONSTANCIA ni está activo
     Acción: Subir Constancia ARCA vigente
```

#### REQUISITO 2: Empresa tiene AP vigente que cubre evento

```
¿La empresa tiene AP (Accidentes Personales) vigente?
  └─ Query: existe AP en documentos

Y ¿cubre el rango completo de trabajo?
  └─ AP.validity_from ≤ event.pre_production_start
  └─ AP.validity_to ≥ event.post_production_end

Resultado:
  ✅ OK - Empresa tiene AP que cubre evento
  ❌ FALTA - Empresa no tiene AP vigente
     Acción: Subir AP vigente que cubra evento
```

#### RESULTADO EAU

```
¿AMBOS requisitos (1 y 2) son OK?
  SÍ  → ✅ APPROVED (puede ingresar)
  NO  → ❌ REJECTED (no puede ingresar)
        + listado de acciones para resolver
```

---

### Pseudocódigo

```javascript
const validateEmployeeB2 = async (employee, employee_type, submission, event) => {
  const validation = {
    employee_id: employee.event_employee_id,
    name: employee.full_name_normalized,
    type: employee_type.type,
    requirements: {},
    approved: false,
    actions_required: [],
  }

  if (employee_type.type === 'ERD') {
    // REQ 1: ART nómina
    const art = submission.documents_a
      .filter(d => d.type === 'ART')
      .find(art => {
        const in_employees = art.extracted_data.employees.some(
          e => e.cuil_plain === employee.cuil_plain || e.dni === employee.dni
        )
        return (
          in_employees &&
          art.validity_from <= event.pre_production_start &&
          event.post_production_end <= art.validity_to
        )
      })

    validation.requirements.req_1_art = {
      status: art ? 'OK' : 'FALTA',
      details: art ? `En ART ${art.insurer_name}` : 'No en ART vigente',
    }
    if (!art) validation.actions_required.push('Subir ART con empleado')

    // REQ 2: CAT/ARCA
    const cat = submission.documents_a
      .filter(d => d.type === 'CAT')
      .find(
        c =>
          (c.employee_cuil === employee.cuil_plain || c.employee_dni === employee.dni) &&
          c.validity_from <= event.production_date &&
          event.production_date <= c.validity_to
      )

    let req2_status = 'FALTA'
    if (cat) {
      req2_status = 'OK'
    } else {
      const arca = await queryARCA(employee.cuil_plain)
      if (arca.is_active_employee) req2_status = 'OK'
    }

    validation.requirements.req_2_cat_or_arca = {
      status: req2_status,
    }
    if (req2_status === 'FALTA')
      validation.actions_required.push('Subir CAT O verificar ARCA')

    // REQ 3: SVO/F931
    const svo = submission.documents_a
      .filter(d => d.type === 'SVO')
      .find(
        s =>
          s.extracted_data.employees.some(
            e => e.cuil_plain === employee.cuil_plain || e.dni === employee.dni
          ) &&
          s.validity_from <= event.production_date &&
          event.production_date <= s.validity_to
      )

    let req3_status = 'FALTA'
    if (svo) {
      req3_status = 'OK'
    } else {
      const f931 = submission.documents_a.find(
        f =>
          f.type === 'F931' &&
          f.extracted_data.employees.some(
            e => e.cuil_plain === employee.cuil_plain || e.dni === employee.dni
          ) &&
          f.validity_from <= event.production_date &&
          event.production_date <= f.validity_to
      )
      if (f931) req3_status = 'OK'
    }

    validation.requirements.req_3_svo_f931 = {
      status: req3_status,
    }
    if (req3_status === 'FALTA')
      validation.actions_required.push('Subir SVO O F931 vigente')

    // RESULTADO
    const all_ok =
      validation.requirements.req_1_art.status === 'OK' &&
      validation.requirements.req_2_cat_or_arca.status === 'OK' &&
      validation.requirements.req_3_svo_f931.status === 'OK'

    validation.approved = all_ok
  } else if (employee_type.type === 'EAU') {
    // REQ 1: CONSTANCIA ARCA
    const constancia = submission.documents_a
      .filter(d => d.type === 'CONSTANCIA_ARCA')
      .find(
        c =>
          c.employee_cuil === employee.cuil_plain &&
          c.validity_to >= event.production_date
      )

    let req1_status = 'FALTA'
    if (constancia) {
      req1_status = 'OK'
    } else {
      const arca = await queryARCA(employee.cuil_plain)
      if (arca.is_active_autonomous && arca.validity_to >= event.production_date)
        req1_status = 'OK'
    }

    validation.requirements.req_1_constancia = {
      status: req1_status,
    }
    if (req1_status === 'FALTA')
      validation.actions_required.push('Subir Constancia ARCA vigente')

    // REQ 2: AP empresa
    const ap = submission.documents_a
      .filter(d => d.type === 'AP')
      .find(
        a =>
          a.validity_from <= event.pre_production_start &&
          event.post_production_end <= a.validity_to
      )

    validation.requirements.req_2_ap = {
      status: ap ? 'OK' : 'FALTA',
    }
    if (!ap) validation.actions_required.push('Empresa debe subir AP vigente')

    // RESULTADO
    const all_ok =
      validation.requirements.req_1_constancia.status === 'OK' &&
      validation.requirements.req_2_ap.status === 'OK'

    validation.approved = all_ok
  }

  return validation
}
```

---

## 8. FLUJO N8N COMPLETO

```
┌──────────────────────────────────────────────────────────┐
│ INICIO: Query Supabase                                   │
│ SELECT * FROM submissions WHERE submission_id = ?        │
│ Obtiene: documents_a, documents_b, event_dates           │
└──────────┬───────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│ VALIDACIÓN A.1: ¿Documentos técnicamente válidos?       │
│                                                          │
│ Loop documents_a:                                        │
│  ├─ ¿Confianza OCR > 85%?                              │
│  ├─ ¿Campos presentes?                                 │
│  ├─ ¿Normalizados correctamente?                       │
│  └─ ¿Auténticos (si CONSTANCIA)?                       │
│                                                          │
│ Status: VALID / PARTIAL / INVALID                        │
└──────────┬───────────────────────────────────────────────┘
           │
      Alguno INVALID?
           │
    ┌──────┴──────┐
    │             │
   SÍ            NO
    │             │
    ▼             ▼
  STOP         Continúa
  REPORT
  ERROR
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│ VALIDACIÓN A.2: ¿Cumplen protocolo?                     │
│                                                          │
│ Loop documents_a (ya validados A.1):                    │
│  ├─ ¿Docs obligatorios presentes?                      │
│  ├─ ¿Relaciones OK (ART→CNR→SVO)?                      │
│  ├─ ¿Vigencias correctas?                              │
│  └─ ¿Datos coinciden?                                  │
│                                                          │
│ Status: CUMPLE / INCOMPLETO / INCUMPLE                  │
└──────────┬───────────────────────────────────────────────┘
           │
      INCUMPLE?
           │
    ┌──────┴──────┐
    │             │
   SÍ            NO
    │             │
    ▼             ▼
  STOP        Continúa
  REPORT
  ERROR
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│ VALIDACIÓN B.1: ¿Inferir tipo (ERD/EAU)?               │
│                                                          │
│ Loop event_employees:                                    │
│  1. ¿En ART? → ERD                                     │
│  2. ¿En CONSTANCIA? → EAU                              │
│  3. Consultar ARCA? → ERD o EAU                        │
│  4. Si nada → UNKNOWN → REJECTED                       │
│                                                          │
│ Status: ERD / EAU / UNKNOWN                             │
└──────────┬───────────────────────────────────────────────┘
           │
    Todos inferidos?
           │
    ┌──────┴──────┐
    │             │
   SÍ            NO
    │             │
    ▼             ▼
Continúa      UNKNOWN
    │         REJECTED
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ VALIDACIÓN B.2: ¿En condiciones de ingresar?           │
│                                                          │
│ Loop event_employees (con type conocido):              │
│                                                          │
│ Si ERD:                                                 │
│  Req 1: ¿En ART nómina?                               │
│  Req 2: ¿CAT O activo ARCA?                           │
│  Req 3: ¿SVO O F931?                                  │
│                                                          │
│ Si EAU:                                                 │
│  Req 1: ¿CONSTANCIA ARCA o ARCA?                      │
│  Req 2: ¿Empresa tiene AP?                            │
│                                                          │
│ Resultado: TODOS OK? → APPROVED : REJECTED              │
└──────────┬───────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│ GENERAR REPORTE FINAL                                    │
│                                                          │
│ Resumen:                                                │
│  ├─ Validación A.1: X documentos VALID/PARTIAL          │
│  ├─ Validación A.2: Protocolo CUMPLE/INCOMPLETO        │
│  ├─ Validación B.1: Tipos inferidos                    │
│  ├─ Validación B.2: X APPROVED, Y REJECTED             │
│  └─ Recomendaciones + acciones                         │
│                                                          │
│ INSERT validation_reports                              │
└──────────────────────────────────────────────────────────┘
```

---

## 9. REPORTE FINAL

```
┌────────────────────────────────────────────────────────────┐
│           REPORTE VALIDACIÓN COMPLETO VALID               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ EVENTO: LA VELA PUERCA (28-Feb-2026)                     │
│ RANGO TRABAJO: 25-Feb a 01-Mar                            │
│ FECHA REPORTE: 02-Mar-2026                                │
│                                                            │
│ ┌─ A.1: VALIDEZ TÉCNICA DE DOCUMENTOS                   │
│ │                                                        │
│ │ ART SULLAIR        ✅ VALID (confidence: 0.95)         │
│ │ CNR SULLAIR        ✅ VALID (confidence: 0.92)         │
│ │ SVO EMPLOYER       ⚠️  PARTIAL (confidence: 0.78)      │
│ │ AP GENERALI        ✅ VALID (confidence: 0.94)         │
│ │ F931 EMPLOYER      ✅ VALID (confidence: 0.91)         │
│ │ CONSTANCIA ARCA    ✅ VALID (confidence: 0.96)         │
│ │                                                        │
│ │ RESULTADO A.1: 5 VALID, 1 PARTIAL, 0 INVALID          │
│ │              → Procede a A.2                           │
│ │                                                        │
│ └────────────────────────────────────────────────────────┘
│                                                            │
│ ┌─ A.2: CUMPLIMIENTO PROTOCOLO                          │
│ │                                                        │
│ │ PROTOCOLO: prot_07 (LA VELA PUERCA 2026)              │
│ │                                                        │
│ │ ART:               ✅ CUMPLE                           │
│ │  ├─ Existe        ✅                                  │
│ │  ├─ Vigencia      ✅                                  │
│ │  ├─ 30 días antes ⚠️  15 días (FLAG)                 │
│ │  ├─ Tiene CNR     ✅                                  │
│ │  └─ Tiene SVO     ✅                                  │
│ │                                                        │
│ │ AP:                ✅ CUMPLE                           │
│ │  ├─ Existe        ✅                                  │
│ │  ├─ Rango 1d-1d   ✅                                  │
│ │  └─ Emisión       ✅                                  │
│ │                                                        │
│ │ CNR:               ✅ CUMPLE                           │
│ │  ├─ Póliza = ART  ✅                                  │
│ │  ├─ CUIT = ART    ✅                                  │
│ │  └─ RS = ART      ✅                                  │
│ │                                                        │
│ │ SVO:               ✅ CUMPLE                           │
│ │                                                        │
│ │ RESULTADO A.2: INCOMPLETO (1 FLAG)                    │
│ │              → Procede a B con advertencia            │
│ │                                                        │
│ └────────────────────────────────────────────────────────┘
│                                                            │
│ ┌─ B.1: INFERENCIA DE TIPO                              │
│ │                                                        │
│ │ Total empleados: 10                                   │
│ │                                                        │
│ │ ERD (8):   Encontrados en ART O ARCA                  │
│ │ EAU (2):   Encontrados en CONSTANCIA O ARCA           │
│ │ UNKNOWN(0):                                            │
│ │                                                        │
│ │ Todos inferidos OK → Procede a B.2                    │
│ │                                                        │
│ └────────────────────────────────────────────────────────┘
│                                                            │
│ ┌─ B.2: EMPLEADOS EN CONDICIONES                        │
│ │                                                        │
│ │ ✅ APROBADOS (8 / 80%):                                │
│ │                                                        │
│ │  1. AXEL ABALOS (ERD)                                 │
│ │     Req 1: ART     ✅ En ART SULLAIR                  │
│ │     Req 2: CAT     ✅ CAT vigente                     │
│ │     Req 3: SVO     ✅ SVO vigente                     │
│ │     → APPROVED                                        │
│ │                                                        │
│ │  2. SILVINA AGUIRRE (ERD)                             │
│ │     Req 1: ART     ✅ En ART SULLAIR                  │
│ │     Req 2: ARCA    ✅ Activa en ARCA                  │
│ │     Req 3: F931    ✅ F931 vigente                    │
│ │     → APPROVED                                        │
│ │                                                        │
│ │  3. MARIA GARCIA (EAU)                                │
│ │     Req 1: CONST   ✅ Constancia vigente              │
│ │     Req 2: AP      ✅ AP empresa vigente              │
│ │     → APPROVED                                        │
│ │                                                        │
│ │  4. CARLOS LOPEZ (ERD)                                │
│ │     Req 1: ART     ✅ En ART SULLAIR                  │
│ │     Req 2: CAT     ✅ CAT vigente                     │
│ │     Req 3: SVO     ✅ SVO vigente                     │
│ │     → APPROVED                                        │
│ │                                                        │
│ │  ... (4 más aprobados) ...                            │
│ │                                                        │
│ │ ─────────────────────────────────────────            │
│ │                                                        │
│ │ ❌ RECHAZADOS (2 / 20%):                               │
│ │                                                        │
│ │  1. JUAN PEREZ (ERD)                                  │
│ │     Req 1: ART     ❌ NO en ART SULLAIR              │
│ │     Req 2: CAT     ✅ CAT vigente                     │
│ │     Req 3: SVO     ✅ SVO vigente                     │
│ │     → REJECTED (falta Req 1)                          │
│ │                                                        │
│ │     ACCIONES:                                         │
│ │      • Subir ART que incluya a JUAN PEREZ             │
│ │                                                        │
│ │  2. PABLO MARTINEZ (EAU)                              │
│ │     Req 1: CONST   ❌ Constancia vencida              │
│ │     Req 2: AP      ✅ AP empresa vigente              │
│ │     → REJECTED (falta Req 1)                          │
│ │                                                        │
│ │     ACCIONES:                                         │
│ │      • Subir Constancia ARCA vigente                  │
│ │                                                        │
│ │ RESULTADO B.2: 8 APPROVED, 2 REJECTED                 │
│ │                                                        │
│ └────────────────────────────────────────────────────────┘
│                                                            │
│ ┌─ CONCLUSIÓN FINAL                                     │
│ │                                                        │
│ │ ESTADO GENERAL: INCOMPLETE (hay pendientes) ⚠️         │
│ │                                                        │
│ │ DOCUMENTACIÓN:                                        │
│ │  • A.1: 5 VALID, 1 PARTIAL (OK)                      │
│ │  • A.2: INCOMPLETO (1 FLAG: ART vigencia)            │
│ │                                                        │
│ │ EMPLEADOS:                                            │
│ │  • Total: 10                                          │
│ │  • Aprobados: 8 (80%)                                 │
│ │  • Rechazados: 2 (20%)                                │
│ │                                                        │
│ │ ACCIONES REQUERIDAS:                                  │
│ │                                                        │
│ │ URGENTE (impiden ingreso):                            │
│ │  1. ❌ Subir ART que incluya a JUAN PEREZ             │
│ │  2. ❌ Subir Constancia ARCA vigente para PABLO       │
│ │                                                        │
│ │ IMPORTANTE (revisar):                                 │
│ │  3. ⚠️  Revisar ART: tiene 15 días antes (pide 30)    │
│ │                                                        │
│ │ SIGUIENTE PASO:                                       │
│ │  → Resolver 2 empleados rechazados                    │
│ │  → Revisar vigencia ART                               │
│ │  → Revalidar cuando se suban documentos               │
│ │                                                        │
│ └────────────────────────────────────────────────────────┘
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## FIN DE LA ESPECIFICACIÓN

**TODO INTEGRADO EN UN ÚNICO DOCUMENTO**

- ✅ Arquitectura General
- ✅ Arquitectura BD (Supabase)
- ✅ Flujo Ariel (Server-Side)
- ✅ Validación A.1 (Documentos válidos)
- ✅ Validación A.2 (Protocolo)
- ✅ Validación B.1 (Tipo ERD/EAU)
- ✅ Validación B.2 (Empleado en condiciones)
- ✅ Flujo N8N Completo
- ✅ Reporte Final
