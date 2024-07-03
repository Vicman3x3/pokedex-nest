import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch(error){
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(termino: string) {

    let pokemon: Pokemon;

    if(!isNaN(+termino)){
      pokemon = await this.pokemonModel.findOne({no:termino});
    }

    if(!pokemon && isValidObjectId(termino)){
      pokemon = await this.pokemonModel.findById(termino)
    }

    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name:termino.toLowerCase().trim()});
    }

    if(!pokemon) throw new NotFoundException(`El Pokemon ${termino} no ha sido encontrado`)


    return pokemon;
  }

  async update(termino: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(termino);
    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      try {
              await pokemon.updateOne(updatePokemonDto);
              return {...pokemon.toJSON(), ...updatePokemonDto};
      } catch (error) {
        this.handleExceptions(error);
      }
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({_id: id});
    if(deletedCount === 0) throw new BadRequestException(`Pokemon con el ID "${id}" no se encuentra`)
    return;
  }

  private handleExceptions(error: any){
    if(error.code === 11000){
      throw new BadRequestException(`El Puchamon ${JSON.stringify(error.keyValue)} ya existe en base de datos`)
    }
    console.log(error);
    throw new InternalServerErrorException(`No se puede crear el Pokemon - revisar los logs`)
  }

}
