FROM python:3.12

RUN pip install --upgrade pip

COPY ./requirements.txt .

RUN pip install -r requirements.txt

RUN django-admin startproject joinit

WORKDIR /joinit

COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
