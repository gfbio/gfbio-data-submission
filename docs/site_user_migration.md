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


