# Generated by Django 5.0.6 on 2024-10-04 17:36

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=30, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('description', models.CharField(max_length=300)),
                ('price', models.DecimalField(decimal_places=2, max_digits=6)),
                ('category', models.CharField(choices=[('CUL', 'Culture'), ('SPR', 'Sport'), ('ART', 'Art'), ('HIS', 'History'), ('EDU', 'Education'), ('ATT', 'Attivism'), ('PRO', 'Protest'), ('HLT', 'Health'), ('ENT', 'Entertainment'), ('COM', 'Commerce'), ('MUS', 'Music'), ('', 'No category')], default='', max_length=3)),
                ('country', models.CharField(max_length=100)),
                ('city', models.CharField(max_length=40)),
                ('region', models.CharField(max_length=100)),
                ('street_name', models.CharField(max_length=100)),
                ('house_number', models.PositiveIntegerField()),
                ('creation_ts', models.DateTimeField(auto_now_add=True)),
                ('last_modified_ts', models.DateTimeField(auto_now=True)),
                ('starting_ts', models.DateTimeField()),
                ('ending_ts', models.DateTimeField()),
                ('max_participants', models.PositiveIntegerField(default=0, null=True)),
                ('participation_deadline', models.DateTimeField(blank=True, default=None, null=True)),
                ('is_private', models.BooleanField(blank=True, default=False)),
                ('cancelled', models.BooleanField(blank=True, default=False)),
                ('tags', models.ManyToManyField(blank=True, to='events.tag')),
            ],
        ),
    ]
