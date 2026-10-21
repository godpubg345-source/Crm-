import random
import string
from apps.crm.students.models import Lead
from apps.operations.branches.models import Branch

def fake_name():
    names = ["Ali", "Sarah", "John", "Emma", "Hassan", "Aisha", "Michael", "Fatima", "David", "Zainab", "Omar", "Amina", "Liam", "Sophia", "Noah"]
    return random.choice(names)

def fake_email(name):
    domains = ["gmail.com", "yahoo.com", "outlook.com", "example.com"]
    return f"{name.lower()}.{random.randint(100,999)}@{random.choice(domains)}"

def fake_phone():
    return "+44" + "".join(random.choices(string.digits, k=9))

COUNTRIES = ["United Kingdom", "Canada", "Australia", "USA", "Ireland", "Dubai"]

def populate():
    print("Starting lead population...")
    branches = list(Branch.objects.all())
    if not branches:
        print("No branches found! Generating a generic branch.")
        branch = Branch.objects.create(name="Global HQ", city="London")
        branches.append(branch)
    else:
        print(f"Found {len(branches)} branches.")
        
    count = 0
    # Add dummy leads for each branch and country
    for branch in branches:
        for country in COUNTRIES:
            # Let's add 5-8 leads per country per branch
            num_leads = random.randint(5, 8)
            for _ in range(num_leads):
                fname = fake_name()
                lname = fake_name()
                lead = Lead.objects.create(
                    branch=branch,
                    first_name=fname,
                    last_name=lname,
                    email=fake_email(fname),
                    phone=fake_phone(),
                    source=random.choice([c[0] for c in Lead.Source.choices]),
                    status=random.choice([c[0] for c in Lead.Status.choices]),
                    priority=random.choice([c[0] for c in Lead.Priority.choices]),
                    score=random.randint(20, 90),
                    target_country=country,
                    win_probability=round(random.uniform(15.0, 90.0), 2)
                )
                count += 1
                
    print(f"Successfully created {count} total dummy leads across {len(branches)} branches and {len(COUNTRIES)} countries.")

populate()
