// Indian GST States and Codes Reference
export interface StateCode {
  code: string;
  name: string;
}

export const INDIAN_STATES: StateCode[] = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
];

export interface ItemPreset {
  category: string;
  description: string;
  partNo: string;
  hsnSac: string;
  unit: string;
  defaultRemarks?: string;
}

export const INDUSTRIAL_ITEMS_CATALOG: ItemPreset[] = [
  {
    category: 'PLC & Controllers',
    description: 'Siemens SIMATIC S7-1200 CPU 1214C DC/DC/DC, 14 DI / 10 DO / 2 AI',
    partNo: '6ES7214-1AG40-0XB0',
    hsnSac: '85371090',
    unit: 'Nos',
    defaultRemarks: 'New in box with warranty seal intact',
  },
  {
    category: 'PLC & Controllers',
    description: 'Rockwell Allen-Bradley CompactLogix 5370 L30ER Controller',
    partNo: '1769-L30ER',
    hsnSac: '85371090',
    unit: 'Nos',
    defaultRemarks: 'Pre-programmed firmware v32',
  },
  {
    category: 'PLC & Controllers',
    description: 'Delta DVP-28SV2 Compact Advanced Programmable Logic Controller',
    partNo: 'DVP28SV11T2',
    hsnSac: '85371090',
    unit: 'Nos',
    defaultRemarks: 'With RS485 communication ports',
  },
  {
    category: 'HMI Displays',
    description: 'Weintek 10.1" TFT LCD Touch Screen HMI Gateway',
    partNo: 'cMT3102X',
    hsnSac: '84716070',
    unit: 'Nos',
    defaultRemarks: 'Pre-loaded runtime runtime v2.8',
  },
  {
    category: 'HMI Displays',
    description: 'Schneider Electric Harmony 7" Widescreen HMI Touch Panel',
    partNo: 'HMIST6400',
    hsnSac: '84716070',
    unit: 'Nos',
    defaultRemarks: 'Gasket and mounting clips included',
  },
  {
    category: 'VFD & Drives',
    description: 'ABB ACS580 7.5 kW / 10 HP General Purpose Variable Frequency Drive',
    partNo: 'ACS580-01-018A-4',
    hsnSac: '85044029',
    unit: 'Nos',
    defaultRemarks: 'Configured for dual speed booster pump',
  },
  {
    category: 'VFD & Drives',
    description: 'Delta C2000 Plus Heavy Duty Field-Oriented AC Vector Drive 15kW',
    partNo: 'VFD150C43A-21',
    hsnSac: '85044029',
    unit: 'Nos',
    defaultRemarks: 'Built-in braking chopper module',
  },
  {
    category: 'Sensors & Instrumentation',
    description: 'Sick Photoelectric Distance Sensor 0.1m - 3.5m Range PNP',
    partNo: 'WL100-2P1439',
    hsnSac: '85365090',
    unit: 'Nos',
    defaultRemarks: 'With reflector plate and L-bracket',
  },
  {
    category: 'Sensors & Instrumentation',
    description: 'Pepperl+Fuchs Inductive Proximity Sensor M8 Shielded 2mm PNP NO',
    partNo: 'NBB2-8GS16-E2',
    hsnSac: '85365090',
    unit: 'Nos',
    defaultRemarks: 'Includes 2m PUR connection cable',
  },
  {
    category: 'Control Panels',
    description: 'Main Automation PLC + VFD Control Panel IP55 Rittal Enclosure',
    partNo: 'PANEL-PLC-VFD-01',
    hsnSac: '85371000',
    unit: 'Sets',
    defaultRemarks: 'Complete with internal cooling fan & internal lighting',
  },
  {
    category: 'Gateways & Networking',
    description: 'Advantech UNO-2484G Fanless Embedded Industrial IoT Automation Computer',
    partNo: 'UNO-2484G-6731AE',
    hsnSac: '84715000',
    unit: 'Nos',
    defaultRemarks: 'Windows 10 IoT LTSC with Edge Node Agent',
  },
  {
    category: 'Gateways & Networking',
    description: 'Moxa EDS-208A 8-Port Unmanaged Industrial Ethernet Switch',
    partNo: 'EDS-208A-M-SC',
    hsnSac: '85176290',
    unit: 'Nos',
    defaultRemarks: 'DIN-rail mount, dual 24VDC redundant inputs',
  },
  {
    category: 'Cables & Wiring',
    description: 'Lapp OLFLEX CLASSIC 110 4G1.5 Flexible Control Cable 100m Drum',
    partNo: 'LAPP-1119304',
    hsnSac: '85444999',
    unit: 'Roll',
    defaultRemarks: 'Flame retardant, oil resistant jacket',
  },
  {
    category: 'Tools & Testing Kits',
    description: 'Fluke 789 ProcessMeter Loop Calibrator & Multimeter (Loaner Unit)',
    partNo: 'FLUKE-789-KIT',
    hsnSac: '90303100',
    unit: 'Nos',
    defaultRemarks: 'Returnable calibration kit - test equipment',
  },
];

export interface ServicePreset {
  description: string;
  sacCode: string;
  defaultRate: number;
  unit: string;
}

export const INDUSTRIAL_SERVICES_CATALOG: ServicePreset[] = [
  {
    description: 'PLC Programming & Logic Implementation (Siemens/Rockwell/Delta)',
    sacCode: '998313',
    defaultRate: 4500,
    unit: 'Hours',
  },
  {
    description: 'HMI Screen Design, Mimic Layout & Alarm Management Setup',
    sacCode: '998313',
    defaultRate: 3500,
    unit: 'Hours',
  },
  {
    description: 'SCADA System Development, Historian & Database Integration',
    sacCode: '998313',
    defaultRate: 45000,
    unit: 'Job',
  },
  {
    description: 'Control Panel Electrical Engineering & Schematic Drafting (EPLAN)',
    sacCode: '998314',
    defaultRate: 25000,
    unit: 'Sets',
  },
  {
    description: 'Field Instrument Wiring, Loop Checking & Sensor Termination',
    sacCode: '995462',
    defaultRate: 350,
    unit: 'Points',
  },
  {
    description: 'PLC Commissioning, Hardware Config & On-Site IO Dry Runs',
    sacCode: '998717',
    defaultRate: 12000,
    unit: 'Days',
  },
  {
    description: 'HMI / SCADA On-Site Commissioning & Production Trial Support',
    sacCode: '998717',
    defaultRate: 12000,
    unit: 'Days',
  },
  {
    description: 'VFD Parameter Configuration, Motor Autotuning & Optimization',
    sacCode: '998717',
    defaultRate: 4000,
    unit: 'Units',
  },
  {
    description: 'Industrial Automation Annual Preventive Maintenance & Health Check',
    sacCode: '998717',
    defaultRate: 35000,
    unit: 'Visit',
  },
  {
    description: 'Emergency Breakdown Site Visit & Rapid Troubleshooting',
    sacCode: '998717',
    defaultRate: 15000,
    unit: 'Days',
  },
  {
    description: 'Industrial Control System Site Installation Supervision',
    sacCode: '995462',
    defaultRate: 8500,
    unit: 'Days',
  },
  {
    description: 'Industrial IoT Gateway Configuration, Modbus Mapping & Cloud Telemetry',
    sacCode: '998313',
    defaultRate: 18000,
    unit: 'Node',
  },
  {
    description: 'Remote Diagnostic Assistance & Remote Patch Deployment',
    sacCode: '998313',
    defaultRate: 2500,
    unit: 'Hours',
  },
  {
    description: 'Custom Automation Software Development (C# / Python / OPC UA)',
    sacCode: '998313',
    defaultRate: 4500,
    unit: 'Hours',
  },
  {
    description: 'Engineering Consultancy, SIL & Machine Safety Compliance Audit',
    sacCode: '998311',
    defaultRate: 50000,
    unit: 'Job',
  },
  {
    description: 'Senior Field Service Engineer Travel & Site Accommodation Allowance',
    sacCode: '996421',
    defaultRate: 6500,
    unit: 'Days',
  },
];
