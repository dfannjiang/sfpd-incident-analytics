def compute_user_friendly_category(
  incident_category,
  incident_description
):
    inc_desc = incident_description.lower()
    if incident_category == 'Malicious Mischief':
        if 'vandalism' in inc_desc or 'graffiti' in inc_desc:
            return 'Vandalism/Graffiti'
        else:
            return incident_category
    elif incident_category == 'Larceny Theft':
        if 'vehicle' in inc_desc:
            return 'Theft from vehicle'
        elif 'shoplifting' in inc_desc:
            return 'Shoplifting'
        elif 'building' in inc_desc:
            return 'Theft from building'
        elif 'license plate' in inc_desc:
            return inc_desc
        else:
            return  'Misc Larceny Theft'
    elif incident_category == 'Other Miscellaneous':
        if incident_description == 'Trespassing':
            return 'Trespassing'
        elif incident_description == 'Investigative Detention':
            return 'Investigative Detention'
        else:
            return 'Other Miscellaneous'
    else:
        return incident_category