# Generated by Django 3.0.6 on 2021-04-20 12:33

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0016_user_agreed_to_privacy'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExternalUserId',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('external_id', models.CharField(help_text='Not Required. 32 characters or fewer. Has to be unique if not Null.', max_length=32)),
                ('provider', models.CharField(help_text='Name of provider of this external id', max_length=32)),
                ('resolver_url', models.URLField(blank=True, help_text='An URL to resolve the value of "external_id"', max_length=64, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddConstraint(
            model_name='externaluserid',
            constraint=models.UniqueConstraint(fields=('external_id', 'provider'), name='unique_id_for_provider'),
        ),
    ]