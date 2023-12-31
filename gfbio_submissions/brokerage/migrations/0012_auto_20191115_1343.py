# Generated by Django 2.2.3 on 2019-11-15 13:43

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("brokerage", "0011_auto_20191114_1405"),
    ]

    operations = [
        migrations.AlterField(
            model_name="siteconfiguration",
            name="contact",
            field=models.EmailField(
                help_text="Main contact to address in case of something. This will, in any case, serve as a fallback when no other person can be determined.",
                max_length=254,
            ),
        ),
    ]
