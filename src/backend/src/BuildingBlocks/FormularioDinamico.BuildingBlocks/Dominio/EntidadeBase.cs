namespace FormularioDinamico.BuildingBlocks.Dominio;

public abstract class EntidadeBase<TIdentificador>
    where TIdentificador : notnull
{
    public TIdentificador Id { get; protected set; } = default!;

    public override bool Equals(object? obj)
    {
        if (obj is not EntidadeBase<TIdentificador> outraEntidade)
        {
            return false;
        }

        return EqualityComparer<TIdentificador>.Default.Equals(Id, outraEntidade.Id);
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Id);
    }
}