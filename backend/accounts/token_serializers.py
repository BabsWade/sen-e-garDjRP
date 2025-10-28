from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Ajoute des infos dans le token pour le frontend
        token['role'] = user.role
        token['superieur_hierarchique'] = user.superieur_hierarchique
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Retourne aussi ces infos dans la réponse à la connexion
        data['role'] = self.user.role
        data['superieur_hierarchique'] = self.user.superieur_hierarchique
        return data
