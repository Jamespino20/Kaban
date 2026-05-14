-- ============================================================
-- Migration 008: Unique Tenant Metadata
-- Replaces placeholder data with rich, location-specific content
-- for 6 Philippine cooperatives.
-- ============================================================

-- Add new tenant groups for regions not yet covered by seed
INSERT IGNORE INTO tenant_groups (name, reg_code) VALUES
    ('Northern Luzon Sector', 'AGP_NL'),
    ('Visayas Sector',       'AGP_VS'),
    ('Mindanao Sector',      'AGP_MS');

-- =============================================================
-- 1. Malolos City Cooperative (slug: malolos)
--    Multipurpose Cooperative — Malolos City, Bulacan
--    Already exists from seed; update its metadata.
-- =============================================================
UPDATE tenants SET
    name        = 'Malolos City Cooperative',
    brand_color = '#2563eb',
    region      = 'Central Luzon',
    metadata    = '{
        "mission": "Magbigay ng accessible at abot-kayang serbisyong pinansyal sa bawat Malolenyo. Naniniwala kami na ang tunay na pag-unlad ay nagsisimula sa malasakit sa kapwa at pagtutulungan ng bawat kasapi.",
        "vision": "Isang malaya at maunlad na pamayanan ng Malolos kung saan ang bawat pamilya ay may kakayahang pinansyal, may sariling negosyo, at may pag-asa para sa mas maliwanag na kinabukasan.",
        "values": [
            {"icon": "fa-heart",              "label": "Malasakit"},
            {"icon": "fa-shield-halved",      "label": "Integridad"},
            {"icon": "fa-handshake",          "label": "Pagkakaisa"},
            {"icon": "fa-people-arrows",      "label": "Serbisyo Publiko"}
        ],
        "heroHeadline": "Ang Agapay ng Bawat Malolenyo",
        "heroSubheadline": "Sama-sama sa pag-unlad, walang naiiwan.",
        "category": "Multipurpose Cooperative",
        "official_email": "malolos@agapay.coop",
        "phone": "(044) 791-2345",
        "address": "2F Malolos Public Market Bldg., Brgy. San Vicente, Malolos City, Bulacan 3000",
        "testimonials": [
            {
                "quote": "Dahil sa cooperative, nakapagpautang ako ng dagdag puhunan para sa aking karenderya. Ngayon, tatlo na ang branch ko sa Malolos!",
                "author": "Aling Rosa Mercado",
                "role": "Food Vendor, 3 years member"
            },
            {
                "quote": "Ang laki ng natipid ko sa interes kumpara sa 5-6. Hindi lang pera ang nakuha ko, kundi tunay na kapatiran.",
                "author": "Ka Lito Villanueva",
                "role": "Tricycle Operator, Member since 2021"
            },
            {
                "quote": "Dito ko unang nakatikim ng loan na walang hidden charges. Tuwing may problema, andyan ang kooperatiba para tumulong.",
                "author": "Maricel Reyes",
                "role": "Sari-Sari Store Owner"
            }
        ]
    }'
WHERE slug = 'malolos';

-- =============================================================
-- 2. Baguio City Cooperative (slug: baguio)
--    Farmers & Producers Cooperative — Baguio City, Benguet
-- =============================================================
INSERT INTO tenants (name, slug, tenant_group_id, brand_color, region, is_active, entitlement_status, metadata)
SELECT
    'Baguio City Cooperative',
    'baguio',
    (SELECT group_id FROM tenant_groups WHERE reg_code = 'AGP_NL'),
    '#16a34a',
    'Northern Luzon',
    1,
    'active',
    '{
        "mission": "Suportahan ang mga magsasaka at maliit na negosyante sa Cordillera sa pamamagitan ng patas na presyo, accessible na pautang, at sama-samang marketing ng kanilang mga produkto mula sa bukid hanggang sa mesa.",
        "vision": "Isang rehiyong bulubundukin kung saan ang bawat magsasaka ay may kakayahang magsaka nang may dignidad, katiyakan, at sapat na kita — hindi lamang para mabuhay, kundi para umunlad.",
        "values": [
            {"icon": "fa-mountain",          "label": "Pagpupunyagi"},
            {"icon": "fa-seedling",          "label": "Kooperasyon"},
            {"icon": "fa-leaf",              "label": "Kalikasan"},
            {"icon": "fa-scale-balanced",    "label": "Katapatan"}
        ],
        "heroHeadline": "Pagyamanin ang Lupa, Pagyamanin ang Buhay",
        "heroSubheadline": "Taguyod ng magsasaka, alagá ng kalikasan.",
        "category": "Farmers & Producers Cooperative",
        "official_email": "baguio@agapay.coop",
        "phone": "(074) 442-3123",
        "address": "Km. 4 La Trinidad-Baguio Rd., Brgy. Balili, La Trinidad, Benguet 2601",
        "testimonials": [
            {
                "quote": "Dati, sa mga middleman ako bumebenta ng aking strawberries. Ngayon, sa cooperative, mas mataas ang kita at may kasiguraduhan.",
                "author": "Mang Pedro Bangsoy",
                "role": "Strawberry Farmer"
            },
            {
                "quote": "Ang cooperative ang nagturo sa akin ng tamang pagtatanim at pagbebenta. Hindi na ako lugi sa palengke.",
                "author": "Nena Cariño",
                "role": "Vegetable Vendor, La Trinidad"
            },
            {
                "quote": "Nakabili ako ng sariling pickup truck dahil sa pautang ng kooperatiba. Ngayon diretso na ang deliver ko ng gulay sa Baguio.",
                "author": "Johnny Wandagan",
                "role": "Farmer & Transporter"
            }
        ]
    }'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'baguio');

-- =============================================================
-- 3. Cebu City Cooperative (slug: cebu)
--    Transport & Service Cooperative — Cebu City, Cebu
-- =============================================================
INSERT INTO tenants (name, slug, tenant_group_id, brand_color, region, is_active, entitlement_status, metadata)
SELECT
    'Cebu City Cooperative',
    'cebu',
    (SELECT group_id FROM tenant_groups WHERE reg_code = 'AGP_VS'),
    '#dc2626',
    'Visayas',
    1,
    'active',
    '{
        "mission": "Paglingkuran ang sektor ng transportasyon at maliliit na negosyo sa Cebu sa pamamagitan ng mabilis at maaasahang serbisyong pinansyal — mga pautang para sa jeepney, multicab, at tindahan na angkop sa tunay na pangangailangan ng kasapi.",
        "vision": "Isang Cebu kung saan ang bawat driver, operator, at maliit na negosyante ay may kakayahang makamit ang kanilang mga pangarap — may sariling sasakyan, lumalagong negosyo, at panatag na kinabukasan.",
        "values": [
            {"icon": "fa-route",            "label": "Paglaum (Hope)"},
            {"icon": "fa-people-group",     "label": "Panaghiusa (Unity)"},
            {"icon": "fa-clock",            "label": "Kasaligan (Reliability)"}
        ],
        "heroHeadline": "Lig-on ang Pundasyon, Hayag ang Kaugmaon",
        "heroSubheadline": "Sakay na sa pag-unlad!",
        "category": "Transport & Service Cooperative",
        "official_email": "cebu@agapay.coop",
        "phone": "(032) 412-5678",
        "address": "Unit 8, Cebu South Terminal Bldg., Brgy. San Nicolas, Cebu City 6000",
        "testimonials": [
            {
                "quote": "Dahil sa cooperative loan, na-renew ko ang aking jeepney at dumami ang pasahero. Malaking tulong ang mababang interes!",
                "author": "Mang Juanito Flores",
                "role": "Jeepney Driver-Operator"
            },
            {
                "quote": "Mula sa pagtitinda sa kanto, may sarili na akong maliit na grocery. Hindi lang pera ang ibinigay nila — kundi ang tyansa na umangat sa buhay.",
                "author": "Ate Maria Gonzales",
                "role": "Sari-Sari Store Owner"
            },
            {
                "quote": "Ang cooperative ay parang pamilya. Nandyan sila sa magandang panahon at sa panahon ng kagipitan.",
                "author": "Ricky Sante",
                "role": "Multicab Operator"
            }
        ]
    }'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'cebu');

-- =============================================================
-- 4. Iloilo City Cooperative (slug: iloilo)
--    Women's Cooperative — Iloilo City, Iloilo
-- =============================================================
INSERT INTO tenants (name, slug, tenant_group_id, brand_color, region, is_active, entitlement_status, metadata)
SELECT
    'Iloilo City Cooperative',
    'iloilo',
    (SELECT group_id FROM tenant_groups WHERE reg_code = 'AGP_VS'),
    '#d946ef',
    'Visayas',
    1,
    'active',
    '{
        "mission": "Palakasin ang kakayahan ng bawat Kababaihang Ilonggo sa pamamagitan ng livelihood programs, financial literacy, at patas na pagkakataon sa negosyo. Naniniwala kami na ang bawat babae ay may kakayahang maging negosyante at lider sa kanyang komunidad.",
        "vision": "Isang Iloilo kung saan ang bawat babae ay may kakayahang pinansyal, may sariling kita, at may boses sa komunidad — malaya mula sa kahirapan at may magandang kinabukasan para sa kanyang pamilya.",
        "values": [
            {"icon": "fa-hands-holding-child",  "label": "Pagpakabana (Care)"},
            {"icon": "fa-hand-holding-hand",    "label": "Pagbuligay (Helping)"},
            {"icon": "fa-face-smile",           "label": "Pagrespeto (Respect)"}
        ],
        "heroHeadline": "Babae, Kaya Mo!",
        "heroSubheadline": "Nagkakaisa para sa progresibong kababaihan ng Iloilo.",
        "category": "Women''s Cooperative",
        "official_email": "iloilo@agapay.coop",
        "phone": "(033) 503-7890",
        "address": "2F Robinson''s Place Jaro, Brgy. San Pedro, Jaro, Iloilo City 5000",
        "testimonials": [
            {
                "quote": "Mula sa paglalaba para sa iba, ngayon may-ari na ako ng sariling laundry shop. Ang cooperative ang nagtiwala sa akin noong walang ibang nagtiwala.",
                "author": "Emma Salvacion",
                "role": "Laundry Shop Owner"
            },
            {
                "quote": "Tinuruan ako ng cooperative paano mag-ipon at mag-manage ng pera. Hindi lang negosyo ang natutunan ko, kundi ang maging independent.",
                "author": "Luzviminda Dalisay",
                "role": "Home Baker & Caterer"
            },
            {
                "quote": "Dati takot akong mangutang. Ngayon, alam ko na ang aking karapatan at responsibilidad bilang miyembro. Malaki ang pinagbago ko simula nung sumali ako.",
                "author": "Teresa Javelosa",
                "role": "Ukay-Ukay Vendor"
            }
        ]
    }'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'iloilo');

-- =============================================================
-- 5. Davao City Cooperative (slug: davao)
--    Fisherfolk & Farmers Cooperative — Davao City, Davao del Sur
-- =============================================================
INSERT INTO tenants (name, slug, tenant_group_id, brand_color, region, is_active, entitlement_status, metadata)
SELECT
    'Davao City Cooperative',
    'davao',
    (SELECT group_id FROM tenant_groups WHERE reg_code = 'AGP_MS'),
    '#0891b2',
    'Mindanao',
    1,
    'active',
    '{
        "mission": "Itaguyod ang mga mangingisda at magsasaka sa Davao Region sa pamamagitan ng access sa puhunan, makabagong kagamitan, at direktang merkado para sa kanilang produkto. Sama-sama nating palakasin ang sektor ng agrikultura at pangisdaan.",
        "vision": "Isang Davao kung saan ang sektor ng agrikultura at pangingisda ay yumayabong — may sapat na kita, modernong teknolohiya, at matiwasay na pamumuhay. Ang bawat magsasaka at mangingisda ay katuwang sa pag-unlad ng rehiyon.",
        "values": [
            {"icon": "fa-droplet",              "label": "Dignidad"},
            {"icon": "fa-hand-holding-heart",   "label": "Pagtinabangay"},
            {"icon": "fa-truck-ramp-box",       "label": "Kalamidad"}
        ],
        "heroHeadline": "Mula sa Dagat at Lupa, Tungo sa Kaunlaran",
        "heroSubheadline": "Bawat hirap ay may katumbas na tagumpay.",
        "category": "Fisherfolk & Farmers Cooperative",
        "official_email": "davao@agapay.coop",
        "phone": "(082) 224-3456",
        "address": "Bankerohan Public Market Compound, Brgy. 5-A, Davao City 8000",
        "testimonials": [
            {
                "quote": "Ang cooperative ang nagbigay sa amin ng bangka at lambat. Dumoble ang huli ko at hindi na ako umaasa sa mga mangangalakal.",
                "author": "Mang Ben Tampus",
                "role": "Fisherfolk, Island Garden City of Samal"
            },
            {
                "quote": "Dahil sa cooperative, nakabili ako ng mas maayos na sakahan at patubig. Ngayon tatlong beses na ang ani ko sa isang taon.",
                "author": "Rolando Katipunan",
                "role": "Rice & Corn Farmer"
            },
            {
                "quote": "Kaya naming magproseso ng sarili naming mangga at saging para ibenta sa mall. Malayo na ang narating namin dahil sa tulong ng kooperatiba.",
                "author": "Lorna Ayson",
                "role": "Fruit Processor & Vendor"
            }
        ]
    }'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'davao');

-- =============================================================
-- 6. Manila Cooperative (slug: manila)
--    Urban Poor Cooperative — Manila, Metro Manila
-- =============================================================
INSERT INTO tenants (name, slug, tenant_group_id, brand_color, region, is_active, entitlement_status, metadata)
SELECT
    'Manila Cooperative',
    'manila',
    (SELECT group_id FROM tenant_groups WHERE reg_code = 'AGP_NCR'),
    '#ea580c',
    'NCR',
    1,
    'active',
    '{
        "mission": "Bigyan ng pagkakataon ang mga urban poor, informal settlers, at maliliit na negosyante sa Maynila na makaahon sa kahirapan sa pamamagitan ng microfinance na may puso — pautang para sa sari-sari store, karinderya, at iba pang kabuhayan.",
        "vision": "Isang Maynila kung saan ang bawat pamilya sa urban poor community ay may matatag na kabuhayan, disenteng tirahan, at pag-asa para sa kanilang mga anak. Ang kahirapan ay hindi hadlang — kundi hamon na sama-sama nating malalampasan.",
        "values": [
            {"icon": "fa-hand-holding-hand",    "label": "Bayanihan"},
            {"icon": "fa-shield",               "label": "Tatag"},
            {"icon": "fa-sun",                  "label": "Pag-asa"}
        ],
        "heroHeadline": "Sa Puso ng Maynila, Nagbabayanihan Tayo",
        "heroSubheadline": "Bawat pamilyang Pilipino ay may karapatan sa maunlad na kinabukasan.",
        "category": "Urban Poor Cooperative",
        "official_email": "manila@agapay.coop",
        "phone": "(02) 8523-4567",
        "address": "2266 Baseco Compound, Brgy. 649, Port Area, Manila 1018",
        "testimonials": [
            {
                "quote": "Maliit na sari-sari store lang ang simula ko. Ngayon, may puhunan na ako para sa apat na tindahan at nagbibigay na ng trabaho sa kapitbahay.",
                "author": "Aling Nena Santos",
                "role": "Sari-Sari Store Chain Owner"
            },
            {
                "quote": "Akala ko hindi na ako makakaahon sa utang. Pero tinulungan ako ng cooperative mag-ipon at magbayad ng maayos. Malaya na ako ngayon sa 5-6.",
                "author": "Boy Ramirez",
                "role": "Tricycle Driver"
            },
            {
                "quote": "Ang cooperative ay hindi lang nagpapahiram ng pera. Tinuturuan ka nila — financial literacy, livelihood training, at nagbibigay ng komunidad na sumusuporta sa iyo.",
                "author": "Cecilia Dimagiba",
                "role": "Carinderia Owner"
            }
        ]
    }'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'manila');
