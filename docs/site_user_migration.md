# Development server

- docker-compose -f production.yml run --rm django python manage.py submission_stats_per_site

        Starting gfbio_submissions_redis_1 ... done
        Starting gfbio_submissions_postgres_1 ... done
        PostgreSQL is available
        
        submissions for sites
            all     gfbio	local-site
            27	    0	    27
        ------------------------------------------




- docker-compose -f production.yml run --rm django python manage.py set_user_ownership

        Starting gfbio_submissions_postgres_1 ... done
        Starting gfbio_submissions_redis_1    ... done
        PostgreSQL is available
        
        ****************	gfbio_related_submissions	**************
            created user "old_gfbio_portal"  False  pk:  20
        
            pk:	site:	user:	submission.submitting_user
        
        ****************	local_site_submissions	**************
        
            pk:	site:	user:	submitting_user:	user_for_submitting_user:
            1	local-site	None	3	3:ikostadi@gfbio.org
                ... set submission user to "ikostadi@gfbio.org"
            14	local-site	None	8	8:marc.weber01
                ... set submission user to "marc.weber01"
            3	local-site	None	3	3:ikostadi@gfbio.org
                ... set submission user to "ikostadi@gfbio.org"
            12	local-site	None	8	8:marc.weber01
                ... set submission user to "marc.weber01"
            8	local-site	None	8	8:marc.weber01
                ... set submission user to "marc.weber01"
            4	local-site	None	9	9:marc_orcid
                ... set submission user to "marc_orcid"
            2	local-site	None	1	no user found for pk=1
            9	local-site	None	8	8:marc.weber01
                ... set submission user to "marc.weber01"
            10	local-site	None	9	9:marc_orcid
                ... set submission user to "marc_orcid"
            5	local-site	None	9	9:marc_orcid
                ... set submission user to "marc_orcid"
            6	local-site	ikostadi	11	11:ikostadi
            13	local-site	None	13	13:maweber
                ... set submission user to "maweber"
            7	local-site	None	8	8:marc.weber01
                ... set submission user to "marc.weber01"
            11	local-site	None	8	8:marc.weber01
                ... set submission user to "marc.weber01"
            18	local-site	None	11	11:ikostadi
                ... set submission user to "ikostadi"
            15	local-site	None	3	3:ikostadi@gfbio.org
                ... set submission user to "ikostadi@gfbio.org"
            17	local-site	None	11	11:ikostadi
                ... set submission user to "ikostadi"
            24	local-site	None	15	15:d.marinuks@jacobs-university.de
                ... set submission user to "d.marinuks@jacobs-university.de"
            19	local-site	None	11	11:ikostadi
                ... set submission user to "ikostadi"
            20	local-site	None	14	no user found for pk=14
            21	local-site	None	14	no user found for pk=14
            22	local-site	None	14	no user found for pk=14
            16	local-site	None	3	3:ikostadi@gfbio.org
                ... set submission user to "ikostadi@gfbio.org"
            23	local-site	None	11	11:ikostadi
                ... set submission user to "ikostadi"
            25	local-site	None	18	18:Deniss
                ... set submission user to "Deniss"
            26	local-site	None	7	7:marc
                ... set submission user to "marc"
            27	local-site	None	19	19:jlinares@gfbio.org
                ... set submission user to "jlinares@gfbio.org"
                
# Production Server

- docker-compose -f production.yml run --rm django python manage.py set_hosting_site_configuration
        
        
        Starting gfbio_submissions_redis_1_1089d6d30996    ... done
        Starting gfbio_submissions_postgres_1_aa1c3c9e18d0 ... done
        PostgreSQL is available
        
        assign site_configuration to user <silvangs-test>
        ... done.
        
        assign site_configuration to user <sventhiel>
        ... done.
        
        assign site_configuration to user <DavidBlaa>
        ... done.
        
        assign site_configuration to user <birgittaries>
        ... done.
        
        assign site_configuration to user <maweber_orcid>
        ... done.
        
        assign site_configuration to user <marc>
        ... done.
        
        assign site_configuration to user <ivo>
        ... done.
        
        assign site_configuration to user <felicitas>
        ... done.
        
        assign site_configuration to user <thoerns>
        ... done.
        
        assign site_configuration to user <TBenFrancis>
        ... done.
        
        assign site_configuration to user <janine>
        ... done.
        
        assign site_configuration to user <foo>
        ... done.
        
        assign site_configuration to user <sven>
        ... done.
        
        assign site_configuration to user <felicitas.loeffler@web.de>
        ... done.
        
        assign site_configuration to user <steckel@sub.uni-goettingen.de>
        ... done.
        
        assign site_configuration to user <carlos.monje@smns-bw.de>
        ... done.
        
        assign site_configuration to user <nitol@rev-mail.net>
        ... done.
        
        assign site_configuration to user <ikostadi>
        ... done.
        
        assign site_configuration to user <marc44>
        ... done.
        
        assign site_configuration to user <dina.sharafeldeen@uni-jena.de>
        ... done.
        
        assign site_configuration to user <michael>
        ... done.
        
        assign site_configuration to user <i.kostadinov>
        ... done.
        
        assign site_configuration to user <maweber>
        ... done.
        
        assign site_configuration to user <bingert>
        ... done.
        
        assign site_configuration to user <mdiepenbroek>
        ... done.
        
        assign site_configuration to user <serviceAcc.5d8cb3066773f>
        ... done.
        
        assign site_configuration to user <serviceAcc.5dcace1d70e7f>
        ... done.
        
        assign site_configuration to user <felicitas.loeffler@uni-jena.de>
        ... done.
        
        assign site_configuration to user <serviceAcc.5dcb2e3459728>
        ... done.
        
        assign site_configuration to user <b.klasen@leibniz-zfmk.de>
        ... done.
        
        assign site_configuration to user <ikostadi@gfbio.org>
        ... done.
        
        assign site_configuration to user <anke.penzlin@senckenberg.de>
        ... done.
        
        assign site_configuration to user <Andreas.Kolter@bot1.bio.uni-giessen.de>
        ... done.
        
        assign site_configuration to user <daniel>
        ... done.
        
        assign site_configuration to user <maweber@mpi-bremen.de>
        ... done.
        
        assign site_configuration to user <serviceAcc.5dd713c4300cf>
        ... done.
        
        assign site_configuration to user <helbing@sub.uni-goettingen.de>
        ... done.
        
        assign site_configuration to user <sven.thiel@uni-jena.de>
        ... done.
        
        assign site_configuration to user <serviceAcc.5dcbfd986a49f>
        ... done.
        
        assign site_configuration to user <p.tweibul>
        ... done.
        
        assign site_configuration to user <AL>
        ... done.
        
        assign site_configuration to user <serviceAcc.5dce75be13f8f>
        ... done.
        
        assign site_configuration to user <serviceAcc.5ddd3b851a857>
        ... done.
        
        assign site_configuration to user <wiebke.walbaum@smns-bw.de>
        ... done.
        
        assign site_configuration to user <serviceAcc.5dcbd9b09cbcf>
        ... done.
        
        assign site_configuration to user <anna.hundsdoerfer@senckenberg.de>
        ... done.
        
        assign site_configuration to user <ilias.lagkouvardos@tum.de>
        ... done.
        
        assign site_configuration to user <paul>
        ... done.
        
        assign site_configuration to user <se>
        ... done.
        
        assign site_configuration to user <alice>
        ... done.
        
        assign site_configuration to user <d.fichtmueller@bgbm.org>
        ... done.
        
        assign site_configuration to user <anfie>
        ... done.
        
        assign site_configuration to user <ila_ros>
        ... done.
        
        assign site_configuration to user <rlperez@mpi-bremen.de>
        ... done.
        
        assign site_configuration to user <sebastian>
        ... done.
        
        assign site_configuration to user <mamolari@mpi-bremen.de>
        ... done.
        
        assign site_configuration to user <MaximRubin>
        ... done.
        
        assign site_configuration to user <serviceAcc.5dd6afa3a3209>
        ... done.
        
        assign site_configuration to user <paul.al.steiner@gmail.com>
        ... done.
        
        assign site_configuration to user <serviceAcc.5df0b42b001fc>
        ... done.
        
        assign site_configuration to user <matthias.wietz@awi.de>
        ... done.
        
        assign site_configuration to user <jie.zhang@uni-wuerzburg.de>
        ... done.
        
        assign site_configuration to user <lars.harms@awi.de>
        ... done.
        
        assign site_configuration to user <ralf.kiese@kit.edu>
        ... done.
        
        assign site_configuration to user <jimena>
        ... done.
        
        assign site_configuration to user <muecker@mpi-bremen.de>
        ... done.
        
        assign site_configuration to user <dmavraki@hcmr.gr>
        ... done.
        
        assign site_configuration to user <jlinares@gfbio.org>
        ... done.
        
        assign site_configuration to user <jklatt>
        ... done.


- docker-compose -f production.yml run --rm django python manage.py submission_stats_per_site


        Starting gfbio_submissions_postgres_1_aa1c3c9e18d0 ... done
        Starting gfbio_submissions_redis_1_1089d6d30996    ... done
        PostgreSQL is available
        
        submissions for sites
            all	gfbio	local-site
            316	252	60
        ------------------------------------------


- docker-compose -f production.yml run --rm django python manage.py set_user_ownership


        Starting gfbio_submissions_postgres_1_aa1c3c9e18d0 ... done
        Starting gfbio_submissions_redis_1_1089d6d30996    ... done
        PostgreSQL is available
        
        ****************	gfbio_related_submissions	**************
            created user "old_gfbio_portal"  True  pk:  75
        
            pk:	site:	user:	submission.submitting_user
            80	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            91	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            98	gfbio-test	None	16250
                ... set submission user to "old_gfbio_portal"
            112	gfbio	None	75576
                ... set submission user to "old_gfbio_portal"
            115	gfbio	None	82525
                ... set submission user to "old_gfbio_portal"
            8	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            21	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            24	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            28	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            31	gfbio-test	None	67811
                ... set submission user to "old_gfbio_portal"
            38	gfbio-dev	None	16250
                ... set submission user to "old_gfbio_portal"
            48	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            46	gfbio	None	72304
                ... set submission user to "old_gfbio_portal"
            54	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            61	gfbio	None	77512
                ... set submission user to "old_gfbio_portal"
            60	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            19	gfbio	None	70001
                ... set submission user to "old_gfbio_portal"
            23	gfbio	None	70001
                ... set submission user to "old_gfbio_portal"
            10	gfbio-test	None	71261
                ... set submission user to "old_gfbio_portal"
            20	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            77	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            30	gfbio	None	76417
                ... set submission user to "old_gfbio_portal"
            56	gfbio	None	73215
                ... set submission user to "old_gfbio_portal"
            14	gfbio	None	73244
                ... set submission user to "old_gfbio_portal"
            204	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            2	gfbio-dev	None	16250
                ... set submission user to "old_gfbio_portal"
            4	gfbio-dev	None	16250
                ... set submission user to "old_gfbio_portal"
            5	gfbio-dev	None	16250
                ... set submission user to "old_gfbio_portal"
            6	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            7	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            81	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            92	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            104	gfbio-dev	None	15926
                ... set submission user to "old_gfbio_portal"
            99	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            113	gfbio-test	None	16250
                ... set submission user to "old_gfbio_portal"
            68	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            78	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            15	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            17	gfbio-dev	None	64609
                ... set submission user to "old_gfbio_portal"
            18	gfbio-dev	None	64609
                ... set submission user to "old_gfbio_portal"
            26	gfbio-dev	None	167607
                ... set submission user to "old_gfbio_portal"
            27	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            29	gfbio-test	None	11926
                ... set submission user to "old_gfbio_portal"
            82	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            93	gfbio-test	None	16250
                ... set submission user to "old_gfbio_portal"
            100	gfbio	None	79804
                ... set submission user to "old_gfbio_portal"
            119	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            132	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            141	gfbio	None	93900
                ... set submission user to "old_gfbio_portal"
            125	gfbio	None	82614
                ... set submission user to "old_gfbio_portal"
            147	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            105	gfbio	None	82406
                ... set submission user to "old_gfbio_portal"
            201	gfbio	None	107864
                ... set submission user to "old_gfbio_portal"
            211	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            175	gfbio	None	103621
                ... set submission user to "old_gfbio_portal"
            33	gfbio-test	None	66702
                ... set submission user to "old_gfbio_portal"
            34	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            35	gfbio-test	None	73230
                ... set submission user to "old_gfbio_portal"
            36	gfbio-test	None	73230
                ... set submission user to "old_gfbio_portal"
            43	gfbio-dev	None	77301
                ... set submission user to "old_gfbio_portal"
            63	gfbio	None	16250
                ... set submission user to "old_gfbio_portal"
            16	gfbio	None	70001
                ... set submission user to "old_gfbio_portal"
            39	gfbio-dev	None	16250
                ... set submission user to "old_gfbio_portal"
            41	gfbio-dev	None	16250
                ... set submission user to "old_gfbio_portal"
            42	gfbio-dev	None	77301
                ... set submission user to "old_gfbio_portal"
            75	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            83	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            94	gfbio-test	None	16250
                ... set submission user to "old_gfbio_portal"
            133	gfbio	None	85108
                ... set submission user to "old_gfbio_portal"
            45	gfbio	None	12939
                ... set submission user to "old_gfbio_portal"
            49	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            106	gfbio	None	82406
                ... set submission user to "old_gfbio_portal"
            205	gfbio	None	12939
                ... set submission user to "old_gfbio_portal"
            202	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            50	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            51	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            52	gfbio-dev	None	16250
                ... set submission user to "old_gfbio_portal"
            53	gfbio-dev	None	16250
                ... set submission user to "old_gfbio_portal"
            64	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            74	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            84	gfbio	None	12939
                ... set submission user to "old_gfbio_portal"
            95	gfbio-test	None	16250
                ... set submission user to "old_gfbio_portal"
            134	gfbio	None	85283
                ... set submission user to "old_gfbio_portal"
            3	gfbio-dev	None	16250
                ... set submission user to "old_gfbio_portal"
            1	gfbio-dev	None	16250
                ... set submission user to "old_gfbio_portal"
            57	gfbio	None	73230
                ... set submission user to "old_gfbio_portal"
            69	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            59	gfbio	None	73230
                ... set submission user to "old_gfbio_portal"
            58	gfbio	None	73230
                ... set submission user to "old_gfbio_portal"
            142	gfbio	None	94422
                ... set submission user to "old_gfbio_portal"
            120	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            85	gfbio	None	78925
                ... set submission user to "old_gfbio_portal"
            135	gfbio	None	85283
                ... set submission user to "old_gfbio_portal"
            107	gfbio	None	82406
                ... set submission user to "old_gfbio_portal"
            13	gfbio-test	None	16250
                ... set submission user to "old_gfbio_portal"
            185	gfbio	None	73230
                ... set submission user to "old_gfbio_portal"
            25	gfbio-dev	None	167607
                ... set submission user to "old_gfbio_portal"
            32	gfbio-test	None	77301
                ... set submission user to "old_gfbio_portal"
            37	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            40	gfbio-dev	None	22439
                ... set submission user to "old_gfbio_portal"
            44	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            174	gfbio	None	67811
                ... set submission user to "old_gfbio_portal"
            187	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            55	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            11	gfbio	None	75576
                ... set submission user to "old_gfbio_portal"
            47	gfbio	None	73230
                ... set submission user to "old_gfbio_portal"
            62	gfbio-dev	None	129827
                ... set submission user to "old_gfbio_portal"
            70	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            86	gfbio	None	77512
                ... set submission user to "old_gfbio_portal"
            121	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            108	gfbio	None	75576
                ... set submission user to "old_gfbio_portal"
            136	gfbio	None	85283
                ... set submission user to "old_gfbio_portal"
            127	gfbio	None	82525
                ... set submission user to "old_gfbio_portal"
            156	gfbio	None	99538
                ... set submission user to "old_gfbio_portal"
            71	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            186	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            89	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            101	gfbio	None	79804
                ... set submission user to "old_gfbio_portal"
            109	gfbio	None	75576
                ... set submission user to "old_gfbio_portal"
            137	gfbio	None	93900
                ... set submission user to "old_gfbio_portal"
            122	gfbio	None	75576
                ... set submission user to "old_gfbio_portal"
            128	gfbio	None	82525
                ... set submission user to "old_gfbio_portal"
            157	gfbio	None	78925
                ... set submission user to "old_gfbio_portal"
            66	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            72	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            76	gfbio-test	None	16250
                ... set submission user to "old_gfbio_portal"
            254	gfbio	None	108464
                ... set submission user to "old_gfbio_portal"
            87	gfbio	None	16250
                ... set submission user to "old_gfbio_portal"
            102	gfbio	None	79804
                ... set submission user to "old_gfbio_portal"
            96	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            117	gfbio	None	82525
                ... set submission user to "old_gfbio_portal"
            110	gfbio	None	79804
                ... set submission user to "old_gfbio_portal"
            138	gfbio	None	93900
                ... set submission user to "old_gfbio_portal"
            79	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            88	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            73	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            97	gfbio-test	None	16250
                ... set submission user to "old_gfbio_portal"
            124	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            149	gfbio	None	94207
                ... set submission user to "old_gfbio_portal"
            103	gfbio	None	79804
                ... set submission user to "old_gfbio_portal"
            90	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            67	gfbio	None	78616
                ... set submission user to "old_gfbio_portal"
            111	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            114	gfbio	None	82525
                ... set submission user to "old_gfbio_portal"
            123	gfbio	None	75576
                ... set submission user to "old_gfbio_portal"
            206	gfbio	None	12939
                ... set submission user to "old_gfbio_portal"
            248	gfbio	None	108464
                ... set submission user to "old_gfbio_portal"
            130	gfbio-test	None	79099
                ... set submission user to "old_gfbio_portal"
            139	gfbio	None	93900
                ... set submission user to "old_gfbio_portal"
            118	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            145	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            143	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            144	gfbio	None	94401
                ... set submission user to "old_gfbio_portal"
            116	gfbio	None	83019
                ... set submission user to "old_gfbio_portal"
            126	gfbio-dev	None	15926
                ... set submission user to "old_gfbio_portal"
            131	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            140	gfbio	None	94272
                ... set submission user to "old_gfbio_portal"
            146	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            158	gfbio	None	101115
                ... set submission user to "old_gfbio_portal"
            129	gfbio-test	None	79099
                ... set submission user to "old_gfbio_portal"
            65	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            153	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            154	gfbio	None	73230
                ... set submission user to "old_gfbio_portal"
            152	gfbio	None	97127
                ... set submission user to "old_gfbio_portal"
            196	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            160	gfbio	None	101235
                ... set submission user to "old_gfbio_portal"
            163	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            162	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            165	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            166	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            151	gfbio	None	93900
                ... set submission user to "old_gfbio_portal"
            249	gfbio	None	108464
                ... set submission user to "old_gfbio_portal"
            184	gfbio	None	75576
                ... set submission user to "old_gfbio_portal"
            159	gfbio	None	99538
                ... set submission user to "old_gfbio_portal"
            177	gfbio-dev	None	278501
                ... set submission user to "old_gfbio_portal"
            180	gfbio	None	73215
                ... set submission user to "old_gfbio_portal"
            182	gfbio	None	99218
                ... set submission user to "old_gfbio_portal"
            178	gfbio	None	75576
                ... set submission user to "old_gfbio_portal"
            183	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            170	gfbio-test	None	25932
                ... set submission user to "old_gfbio_portal"
            155	gfbio	None	78925
                ... set submission user to "old_gfbio_portal"
            193	gfbio	None	16250
                ... set submission user to "old_gfbio_portal"
            167	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            168	gfbio-dev	None	12939
                ... set submission user to "old_gfbio_portal"
            250	gfbio	None	108464
                ... set submission user to "old_gfbio_portal"
            214	gfbio	None	107962
                ... set submission user to "old_gfbio_portal"
            203	gfbio	None	76417
                ... set submission user to "old_gfbio_portal"
            169	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            172	gfbio	None	96001
                ... set submission user to "old_gfbio_portal"
            173	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            148	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            171	gfbio	None	96001
                ... set submission user to "old_gfbio_portal"
            191	gfbio	None	106550
                ... set submission user to "old_gfbio_portal"
            181	gfbio	None	105115
                ... set submission user to "old_gfbio_portal"
            179	gfbio	None	93900
                ... set submission user to "old_gfbio_portal"
            189	gfbio	None	106550
                ... set submission user to "old_gfbio_portal"
            192	gfbio	None	106550
                ... set submission user to "old_gfbio_portal"
            190	gfbio	None	106550
                ... set submission user to "old_gfbio_portal"
            194	gfbio	None	106550
                ... set submission user to "old_gfbio_portal"
            195	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            197	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            188	gfbio	None	106550
                ... set submission user to "old_gfbio_portal"
            176	gfbio	None	103621
                ... set submission user to "old_gfbio_portal"
            198	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            199	gfbio	None	107864
                ... set submission user to "old_gfbio_portal"
            200	gfbio	None	107864
                ... set submission user to "old_gfbio_portal"
            216	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            219	gfbio-test	None	16250
                ... set submission user to "old_gfbio_portal"
            217	gfbio-test	None	16250
                ... set submission user to "old_gfbio_portal"
            218	gfbio-test	None	16250
                ... set submission user to "old_gfbio_portal"
            222	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            215	gfbio	None	79239
                ... set submission user to "old_gfbio_portal"
            227	gfbio	None	16250
                ... set submission user to "old_gfbio_portal"
            253	gfbio	None	108464
                ... set submission user to "old_gfbio_portal"
            256	gfbio	None	108593
                ... set submission user to "old_gfbio_portal"
            251	gfbio	None	108464
                ... set submission user to "old_gfbio_portal"
            224	gfbio-test	None	16250
                ... set submission user to "old_gfbio_portal"
            252	gfbio	None	108464
                ... set submission user to "old_gfbio_portal"
            225	gfbio	None	16250
                ... set submission user to "old_gfbio_portal"
            226	gfbio	None	12939
                ... set submission user to "old_gfbio_portal"
            223	gfbio	None	108065
                ... set submission user to "old_gfbio_portal"
            236	gfbio-test	None	25906
                ... set submission user to "old_gfbio_portal"
            231	gfbio	None	94207
                ... set submission user to "old_gfbio_portal"
            237	gfbio-test	None	25906
                ... set submission user to "old_gfbio_portal"
            238	gfbio-test	None	25906
                ... set submission user to "old_gfbio_portal"
            245	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            232	gfbio	None	73215
                ... set submission user to "old_gfbio_portal"
            247	gfbio	None	99301
                ... set submission user to "old_gfbio_portal"
            257	gfbio	None	108593
                ... set submission user to "old_gfbio_portal"
            246	gfbio	gfbio	108364
            258	gfbio	None	108593
                ... set submission user to "old_gfbio_portal"
            264	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            266	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            259	gfbio	gfbio	93900
            271	gfbio	None	67811
                ... set submission user to "old_gfbio_portal"
            260	gfbio	gfbio	93900
            272	gfbio-test	i.kostadinov	13
            276	gfbio-test	None	12939
                ... set submission user to "old_gfbio_portal"
            275	gfbio-test	gfbio	12939
            255	gfbio	gfbio	108464
            279	gfbio	None	85108
                ... set submission user to "old_gfbio_portal"
            270	gfbio	None	109217
                ... set submission user to "old_gfbio_portal"
            280	gfbio	None	85108
                ... set submission user to "old_gfbio_portal"
            282	gfbio	None	111093
                ... set submission user to "old_gfbio_portal"
            283	gfbio	None	111093
                ... set submission user to "old_gfbio_portal"
            284	gfbio	None	111093
                ... set submission user to "old_gfbio_portal"
            273	gfbio	None	99538
                ... set submission user to "old_gfbio_portal"
            281	gfbio	local-site	111093
            285	gfbio	None	16250
                ... set submission user to "old_gfbio_portal"
            286	gfbio	None	111093
                ... set submission user to "old_gfbio_portal"
            150	gfbio	gfbio	83019
            288	gfbio	None	99538
                ... set submission user to "old_gfbio_portal"
        
        ****************	local_site_submissions	**************
        
            pk:	site:	user:	submitting_user:	user_for_submitting_user:
            207	local-site	None	11	11:maweber_orcid
                ... set submission user to "maweber_orcid"
            208	local-site	None	5	5:ikostadi
                ... set submission user to "ikostadi"
            213	local-site	None	5	5:ikostadi
                ... set submission user to "ikostadi"
            209	local-site	None	5	5:ikostadi
                ... set submission user to "ikostadi"
            210	local-site	None	5	5:ikostadi
                ... set submission user to "ikostadi"
            220	local-site	None	1	1:maweber
                ... set submission user to "maweber"
            221	local-site	None	1	1:maweber
                ... set submission user to "maweber"
            228	local-site	None	5	5:ikostadi
                ... set submission user to "ikostadi"
            229	local-site	None	15	15:maweber@mpi-bremen.de
                ... set submission user to "maweber@mpi-bremen.de"
            242	local-site	None	21	21:felicitas
                ... set submission user to "felicitas"
            243	local-site	None	23	23:sven
                ... set submission user to "sven"
            244	local-site	None	24	24:DavidBlaa
                ... set submission user to "DavidBlaa"
            230	local-site	None	16	16:TBenFrancis
                ... set submission user to "TBenFrancis"
            239	local-site	None	23	23:sven
                ... set submission user to "sven"
            233	local-site	None	12	12:marc44
                ... set submission user to "marc44"
            234	local-site	None	17	17:birgittaries
                ... set submission user to "birgittaries"
            241	local-site	None	23	23:sven
                ... set submission user to "sven"
            235	local-site	None	18	18:foo
                ... set submission user to "foo"
            240	local-site	None	22	22:ikostadi@gfbio.org
                ... set submission user to "ikostadi@gfbio.org"
            269	local-site	None	31	31:nitol@rev-mail.net
                ... set submission user to "nitol@rev-mail.net"
            265	local-site	None	15	15:maweber@mpi-bremen.de
                ... set submission user to "maweber@mpi-bremen.de"
            261	local-site	None	22	22:ikostadi@gfbio.org
                ... set submission user to "ikostadi@gfbio.org"
            262	local-site	None	22	22:ikostadi@gfbio.org
                ... set submission user to "ikostadi@gfbio.org"
            267	local-site	None	22	22:ikostadi@gfbio.org
                ... set submission user to "ikostadi@gfbio.org"
            263	local-site	None	22	22:ikostadi@gfbio.org
                ... set submission user to "ikostadi@gfbio.org"
            268	local-site	None	25	25:felicitas.loeffler@uni-jena.de
                ... set submission user to "felicitas.loeffler@uni-jena.de"
            274	local-site	gfbio	22	22:ikostadi@gfbio.org
            277	local-site	gfbio	22	22:ikostadi@gfbio.org
            278	local-site	None	15	15:maweber@mpi-bremen.de
                ... set submission user to "maweber@mpi-bremen.de"
            212	local-site	None	5	5:ikostadi
                ... set submission user to "ikostadi"
            316	local-site	None	71	71:jklatt
                ... set submission user to "jklatt"
            287	local-site	None	15	15:maweber@mpi-bremen.de
                ... set submission user to "maweber@mpi-bremen.de"
            289	local-site	None	36	36:serviceAcc.5dcb2e3459728
                ... set submission user to "serviceAcc.5dcb2e3459728"
            290	local-site	None	13	13:i.kostadinov
                ... set submission user to "i.kostadinov"
            291	local-site	None	49	49:serviceAcc.5dd6afa3a3209
                ... set submission user to "serviceAcc.5dd6afa3a3209"
            313	local-site	None	51	51:serviceAcc.5df0b42b001fc
                ... set submission user to "serviceAcc.5df0b42b001fc"
            292	local-site	None	49	49:serviceAcc.5dd6afa3a3209
                ... set submission user to "serviceAcc.5dd6afa3a3209"
            293	local-site	None	55	55:anfie
                ... set submission user to "anfie"
            294	local-site	None	55	55:anfie
                ... set submission user to "anfie"
            296	local-site	None	57	57:rlperez@mpi-bremen.de
                ... set submission user to "rlperez@mpi-bremen.de"
            295	local-site	None	56	56:anna.hundsdoerfer@senckenberg.de
                ... set submission user to "anna.hundsdoerfer@senckenberg.de"
            303	local-site	None	61	61:muecker@mpi-bremen.de
                ... set submission user to "muecker@mpi-bremen.de"
            302	local-site	None	56	56:anna.hundsdoerfer@senckenberg.de
                ... set submission user to "anna.hundsdoerfer@senckenberg.de"
            298	local-site	None	49	49:serviceAcc.5dd6afa3a3209
                ... set submission user to "serviceAcc.5dd6afa3a3209"
            297	local-site	None	62	62:mamolari@mpi-bremen.de
                ... set submission user to "mamolari@mpi-bremen.de"
            299	local-site	None	49	49:serviceAcc.5dd6afa3a3209
                ... set submission user to "serviceAcc.5dd6afa3a3209"
            300	local-site	None	49	49:serviceAcc.5dd6afa3a3209
                ... set submission user to "serviceAcc.5dd6afa3a3209"
            304	local-site	None	64	64:matthias.wietz@awi.de
                ... set submission user to "matthias.wietz@awi.de"
            301	local-site	None	61	61:muecker@mpi-bremen.de
                ... set submission user to "muecker@mpi-bremen.de"
            305	local-site	None	42	42:serviceAcc.5dcace1d70e7f
                ... set submission user to "serviceAcc.5dcace1d70e7f"
            306	local-site	None	65	65:paul.al.steiner@gmail.com
                ... set submission user to "paul.al.steiner@gmail.com"
            307	local-site	None	66	66:ralf.kiese@kit.edu
                ... set submission user to "ralf.kiese@kit.edu"
            308	local-site	None	66	66:ralf.kiese@kit.edu
                ... set submission user to "ralf.kiese@kit.edu"
            309	local-site	None	66	66:ralf.kiese@kit.edu
                ... set submission user to "ralf.kiese@kit.edu"
            310	local-site	None	66	66:ralf.kiese@kit.edu
                ... set submission user to "ralf.kiese@kit.edu"
            311	local-site	None	66	66:ralf.kiese@kit.edu
                ... set submission user to "ralf.kiese@kit.edu"
            312	local-site	None	66	66:ralf.kiese@kit.edu
                ... set submission user to "ralf.kiese@kit.edu"
            314	local-site	None	70	70:sebastian
                ... set submission user to "sebastian"
            317	local-site	None	74	74:dmavraki@hcmr.gr
                ... set submission user to "dmavraki@hcmr.gr"
            315	local-site	None	51	51:serviceAcc.5df0b42b001fc
                ... set submission user to "serviceAcc.5df0b42b001fc"
