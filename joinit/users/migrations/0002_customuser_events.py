# Generated by Django 5.0.6 on 2024-10-05 17:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0001_initial'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='events',
            field=models.ManyToManyField(blank=True, to='events.event'),
        ),
    ]
